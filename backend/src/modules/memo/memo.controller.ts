import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardSetsService } from './services/card-sets.service';
import { GamesService } from './services/games.service';
import { GameMovesService } from './services/game-moves.service';
import { LeaderboardService } from './services/leaderboard.service';
import { MemoFilesService } from './services/files.service';
import { ConfigService } from '@nestjs/config';
import { CreateCardSetDto, UpdateCardSetDto } from './dto/create-card-set.dto';
import { CreateCardDto, UpdateCardDto } from './dto/create-card.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { MakeMoveDto } from './dto/make-move.dto';
import { GetLeaderboardDto, LeaderboardPeriod } from './dto/leaderboard.dto';
import { AuditService, AuditAction } from '../../common/services/audit.service';

@ApiTags('Memo Game')
@Controller('memo')
export class MemoController {
  constructor(
    private cardSetsService: CardSetsService,
    private gamesService: GamesService,
    private gameMovesService: GameMovesService,
    private leaderboardService: LeaderboardService,
    private filesService: MemoFilesService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  // ========== Card Sets ==========

  @Get('card-sets')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all public card sets' })
  @ApiResponse({ status: 200, description: 'List of card sets' })
  getCardSets(@Query('limit') limit = 20) {
    return this.cardSetsService.findAll(Number(limit));
  }

  @Get('card-sets/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my card sets' })
  @ApiResponse({ status: 200, description: 'List of user card sets' })
  getMyCardSets(@Req() req) {
    return this.cardSetsService.findUserSets(req.user.userId);
  }

  @Get('card-sets/:id')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Get card set by ID' })
  @ApiResponse({ status: 200, description: 'Card set details' })
  getCardSet(@Param('id') id: string, @Query('cards') includeCards = 'false') {
    return this.cardSetsService.findOne(id, includeCards === 'true');
  }

  @Post('card-sets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new card set' })
  @ApiResponse({ status: 201, description: 'Card set created' })
  createCardSet(@Body() dto: CreateCardSetDto, @Req() req) {
    this.auditService.log({
      action: AuditAction.MEMO_CARDSET_CREATE,
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      details: { name: dto.name, isPublic: dto.isPublic },
    });
    return this.cardSetsService.createCardSet(dto, req.user.userId);
  }

  @Patch('card-sets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update card set' })
  @ApiResponse({ status: 200, description: 'Card set updated' })
  updateCardSet(
    @Param('id') id: string,
    @Body() dto: UpdateCardSetDto,
    @Req() req,
  ) {
    return this.cardSetsService.update(id, dto, req.user.userId);
  }

  @Delete('card-sets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete card set (admin can delete any set)' })
  @ApiResponse({ status: 200, description: 'Card set deleted' })
  deleteCardSet(@Param('id') id: string, @Req() req) {
    this.auditService.log({
      action: AuditAction.MEMO_CARDSET_DELETE,
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      details: { cardSetId: id },
    });
    return this.cardSetsService.delete(id, req.user.userId, req.user.role);
  }

  // ========== Cards ==========

  @Post('card-sets/:setId/cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a card to a set' })
  @ApiResponse({ status: 201, description: 'Card added' })
  createCard(
    @Param('setId') setId: string,
    @Body() dto: CreateCardDto,
    @Req() req,
  ) {
    return this.cardSetsService.createCard(setId, dto, req.user.userId);
  }

  @Patch('cards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card' })
  @ApiResponse({ status: 200, description: 'Card updated' })
  updateCard(@Param('id') id: string, @Body() dto: UpdateCardDto, @Req() req) {
    return this.cardSetsService.updateCard(id, dto, req.user.userId);
  }

  @Delete('cards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card' })
  @ApiResponse({ status: 200, description: 'Card deleted' })
  deleteCard(@Param('id') id: string, @Req() req) {
    return this.cardSetsService.deleteCard(id, req.user.userId);
  }

  // ========== Upload ==========

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a card image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  async uploadCardImage(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Always use getFileUrl() which uses R2_PUBLIC_URL
    const url = this.filesService.getFileUrl((file as any).key);

    this.auditService.log({
      action: AuditAction.MEMO_IMAGE_UPLOAD,
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      details: {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    });

    return { url };
  }

  // ========== Games ==========

  @Post('games')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created' })
  createGame(@Body() dto: CreateGameDto, @Req() req) {
    return this.gamesService.createGame(dto, req.user.userId);
  }

  @Get('games/waiting')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get waiting multiplayer games (for matchmaking)' })
  @ApiResponse({ status: 200, description: 'List of waiting games' })
  @ApiQuery({ name: 'cardSetId', required: false, type: String })
  getWaitingGames(
    @Query('cardSetId') cardSetId?: string,
    @Query('limit') limit = 20,
  ) {
    return this.gamesService.findWaitingMultiplayerGames(cardSetId, Number(limit));
  }

  @Get('games/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my games' })
  @ApiResponse({ status: 200, description: 'List of user games' })
  getMyGames(
    @Req() req,
    @Query('status') status?: string,
    @Query('limit') limit = 20,
  ) {
    return this.gamesService.findUserGames(
      req.user.userId,
      status,
      Number(limit),
    );
  }

  @Get('games/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({ status: 200, description: 'Game details' })
  getGame(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post('games/:id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a game' })
  @ApiResponse({ status: 200, description: 'Game started' })
  startGame(@Param('id') id: string, @Req() req) {
    return this.gamesService.startGame(id, req.user.userId);
  }

  @Post('games/:id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a game' })
  @ApiResponse({ status: 200, description: 'Joined game' })
  joinGame(@Param('id') id: string, @Req() req) {
    return this.gamesService.joinGame(id, req.user.userId);
  }

  @Post('games/:id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a game' })
  @ApiResponse({ status: 200, description: 'Left game' })
  leaveGame(@Param('id') id: string, @Req() req) {
    return this.gamesService.leaveGame(id, req.user.userId);
  }

  @Get('games/:id/moves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get game moves (replay)' })
  @ApiResponse({ status: 200, description: 'Game moves' })
  getGameMoves(@Param('id') id: string) {
    return this.gameMovesService.getGameMoves(id);
  }

  // ========== Moves ==========

  @Post('games/:id/moves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make a move' })
  @ApiResponse({ status: 200, description: 'Move result' })
  async makeMove(
    @Param('id') id: string,
    @Body() dto: MakeMoveDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    // Get game player ID
    const game = await this.gamesService.findOne(id);
    const gamePlayer = game.players.find((p) => p.userId === userId);

    if (!gamePlayer) {
      throw new BadRequestException('Player not found in this game');
    }

    return this.gameMovesService.makeMove(id, gamePlayer.id, dto);
  }

  // ========== Leaderboard ==========

  @Get('leaderboard/single')
  @ApiOperation({ summary: 'Get single player leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard' })
  @UsePipes(new ValidationPipe({ transform: true }))
  getSingleLeaderboard(@Query() query: GetLeaderboardDto) {
    return this.leaderboardService.getSinglePlayerLeaderboard(
      query.period,
      query.limit,
    );
  }

  @Get('leaderboard/multiplayer')
  @ApiOperation({ summary: 'Get multiplayer leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard' })
  @UsePipes(new ValidationPipe({ transform: true }))
  getMultiLeaderboard(@Query() query: GetLeaderboardDto) {
    return this.leaderboardService.getMultiplayerLeaderboard(
      query.period,
      query.limit,
    );
  }

  @Get('leaderboard/user/:userId')
  @ApiOperation({ summary: 'Get user stats' })
  @ApiResponse({ status: 200, description: 'User stats' })
  getUserStats(@Param('userId') userId: string) {
    return this.leaderboardService.getUserStats(userId);
  }
}
