import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { ProductSize } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  category: string;

  @IsArray()
  @IsEnum(ProductSize, { each: true })
  sizes: ProductSize[];

  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
