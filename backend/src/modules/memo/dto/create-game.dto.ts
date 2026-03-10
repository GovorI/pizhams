import { IsEnum, IsInt, IsOptional, IsArray, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameMode } from '../entities/game.entity';

export enum GridSize {
  SMALL = 'small',      // 3x2 = 6 cards
  MEDIUM = 'medium',    // 4x3 = 12 cards
  LARGE = 'large',      // 4x4 = 16 cards
  XLARGE = 'xlarge',    // 6x4 = 24 cards
  XXLARGE = 'xxlarge',  // 8x4 = 32 cards
}

export class CreateGameDto {
  @ApiProperty({ example: 'uuid-card-set-id', description: 'ID набора карточек' })
  @IsString()
  cardSetId: string;

  @ApiProperty({ enum: GameMode, example: GameMode.SINGLE, description: 'Режим игры' })
  @IsEnum(GameMode)
  mode: GameMode;

  @ApiPropertyOptional({ enum: GridSize, example: GridSize.MEDIUM, description: 'Размер поля' })
  @IsEnum(GridSize)
  @IsOptional()
  gridSize?: GridSize;

  @ApiPropertyOptional({ example: 4, description: 'Количество рядов' })
  @IsInt()
  @Min(2)
  @Max(8)
  @IsOptional()
  gridRows?: number;

  @ApiPropertyOptional({ example: 4, description: 'Количество колонок' })
  @IsInt()
  @Min(2)
  @Max(8)
  @IsOptional()
  gridCols?: number;

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], description: 'ID приглашённых игроков (для мультиплеера)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inviteeIds?: string[];
}
