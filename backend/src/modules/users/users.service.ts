import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'role', 'createdAt'],
    });
  }

  async updateProfile(userId: string, email?: string): Promise<User> {
    const user = await this.findById(userId);

    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      user.email = email;
    }

    return await this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);

    const isPasswordValid = await this.validatePassword(user, currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // Invalidate any existing tokens
    await this.dataSource.query(
      `UPDATE password_reset_tokens SET used = true WHERE user_id = $1`,
      [user.id],
    );

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.dataSource.query(
      `INSERT INTO password_reset_tokens (token, user_id, expires_at, used) VALUES ($1, $2, $3, false)`,
      [token, user.id, expiresAt],
    );

    // Send password reset email
    await this.emailService.sendPasswordReset(user.email, user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.dataSource.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token],
    );

    if (!resetToken || resetToken.length === 0) {
      return false;
    }

    const userId = resetToken[0].user_id;
    const user = await this.findById(userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Mark token as used
    await this.dataSource.query(
      `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
      [token],
    );

    return true;
  }

  async validateResetToken(token: string): Promise<boolean> {
    const resetToken = await this.dataSource.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token],
    );

    return resetToken && resetToken.length > 0;
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return await this.userRepository.save(user);
  }

  async ban(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async unban(id: string): Promise<User> {
    await this.userRepository.restore(id);
    return await this.findById(id);
  }
}
