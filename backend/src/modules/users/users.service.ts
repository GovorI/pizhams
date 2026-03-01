import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
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
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      user.email = email;
    }

    return await this.userRepository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
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

  async requestPasswordReset(email: string): Promise<PasswordResetToken | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return null;
    }

    // Invalidate any existing tokens
    await this.resetTokenRepository
      .createQueryBuilder()
      .update()
      .set({ used: true })
      .where('userId = :userId', { userId: user.id })
      .andWhere('used = :used', { used: false })
      .execute();

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const resetToken = this.resetTokenRepository.create({
      token,
      userId: user.id,
      expiresAt,
      used: false,
    });

    const savedToken = await this.resetTokenRepository.save(resetToken);

    // Send password reset email
    await this.emailService.sendPasswordReset(user.email, user.email, token);

    return savedToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token, used: false },
      relations: ['user'],
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    resetToken.user.password = hashedPassword;
    await this.userRepository.save(resetToken.user);

    resetToken.used = true;
    await this.resetTokenRepository.save(resetToken);

    return true;
  }

  async validateResetToken(token: string): Promise<boolean> {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token, used: false },
    });

    return !!(resetToken && resetToken.expiresAt > new Date());
  }
}
