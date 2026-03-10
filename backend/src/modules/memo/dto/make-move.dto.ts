import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MakeMoveDto {
  @ApiProperty({ example: 'uuid-card1-id', description: 'ID первой карточки' })
  @IsUUID()
  @IsString()
  card1Id: string;

  @ApiProperty({ example: 'uuid-card2-id', description: 'ID второй карточки' })
  @IsUUID()
  @IsString()
  card2Id: string;
}
