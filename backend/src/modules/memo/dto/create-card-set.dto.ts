import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardSetDto {
  @ApiProperty({ example: 'Animals', description: 'Название набора карточек' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Cute animals for kids', description: 'Описание набора' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Публичный ли набор' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateCardSetDto {
  @ApiPropertyOptional({ example: 'Updated Animals', description: 'Название набора карточек' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Описание набора' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Публичный ли набор' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
