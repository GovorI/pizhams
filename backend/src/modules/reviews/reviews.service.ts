import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(review);
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { productId, isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateReviewDto);
    
    // Set admin response date if adminResponse is provided
    if (updateReviewDto.adminResponse !== undefined) {
      review.adminResponseDate = new Date();
    }
    
    return await this.reviewRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.reviewRepository.delete(id);
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .getRawOne();

    return result.average ? parseFloat(result.average) : 0;
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllUnapproved(): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { isApproved: false },
      order: { createdAt: 'DESC' },
    });
  }
}
