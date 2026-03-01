import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ProductSize } from '../entities/product.entity';
import { Type } from 'class-transformer';

export class GetProductsFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
