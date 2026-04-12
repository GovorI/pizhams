import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL = 'all',
}

export class GetLeaderboardDto {
  @ApiPropertyOptional({
    enum: LeaderboardPeriod,
    example: LeaderboardPeriod.ALL,
    description: 'Период для лидерборда',
  })
  @IsEnum(LeaderboardPeriod)
  @IsOptional()
  period?: LeaderboardPeriod = LeaderboardPeriod.ALL;

  @ApiPropertyOptional({
    example: 100,
    description: 'Максимальное количество записей',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  limit?: number = 100;
}
