import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    example: 'http://localhost:3000/uploads/card.png',
    description: 'URL изображения карточки',
  })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ example: 1, description: 'Порядковый номер карточки' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCardDto {
  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/new-card.png',
    description: 'URL изображения карточки',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 2, description: 'Порядковый номер карточки' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
