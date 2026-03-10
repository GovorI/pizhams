import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { GamesService } from './services/games.service';
import { GameMovesService } from './services/game-moves.service';
import { MakeMoveDto } from './dto/make-move.dto';

interface JoinGamePayload {
  gameId: string;
}

interface MovePayload extends MakeMoveDto {
  gameId: string;
}

interface ReadyPayload {
  gameId: string;
}

interface LeaveGamePayload {
  gameId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'memo',
})
export class MemoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track which games each client is in
  private clientGames: Map<string, string> = new Map(); // socketId -> gameId
  private gameRooms: Map<string, Set<string>> = new Map(); // gameId -> Set<socketIds>

  constructor(
    private jwtService: JwtService,
    private gamesService: GamesService,
    private gameMovesService: GameMovesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Validate JWT token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      // payload.sub contains user id
      client.data.userId = payload.sub || payload.userId;
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    // Remove from game room
    const gameId = this.clientGames.get(client.id);
    if (gameId) {
      const room = this.gameRooms.get(gameId);
      if (room) {
        room.delete(client.id);
        if (room.size === 0) {
          this.gameRooms.delete(gameId);
        }
      }
      this.clientGames.delete(client.id);

      // Notify others in the game
      client.to(`game:${gameId}`).emit('game:player_left', {
        gameId,
        userId: client.data.userId,
      });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('game:join')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinGamePayload,
  ) {
    const { gameId } = payload;
    const userId = client.data.userId;

    try {
      // Join the game via service
      const game = await this.gamesService.joinGame(gameId, userId);

      // Join Socket.IO room
      client.join(`game:${gameId}`);
      this.clientGames.set(client.id, gameId);

      if (!this.gameRooms.has(gameId)) {
        this.gameRooms.set(gameId, new Set());
      }
      this.gameRooms.get(gameId)!.add(client.id);

      // Notify others
      client.to(`game:${gameId}`).emit('game:player_joined', {
        gameId,
        userId,
        game,
      });

      // Send updated game state to the joining player
      client.emit('game:joined', { game });

      // Broadcast updated state to all
      this.server.to(`game:${gameId}`).emit('game:updated', {
        game,
        players: game?.players || [],
      });
    } catch (error) {
      client.emit('game:error', {
        message: error.message || 'Failed to join game',
        code: 'JOIN_FAILED',
      });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('game:move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MovePayload,
  ) {
    const { gameId, card1Id, card2Id } = payload;
    const userId = client.data.userId;

    try {
      // Get game and find player
      const game = await this.gamesService.findOne(gameId);
      const gamePlayer = game.players.find(p => p.userId === userId);
      
      if (!gamePlayer) {
        throw new Error('Player not found in game');
      }

      const result = await this.gameMovesService.makeMove(gameId, gamePlayer.id, { card1Id, card2Id });

      // Broadcast move result to all players in the game
      this.server.to(`game:${gameId}`).emit('game:move-result', {
        gameId,
        ...result,
        playerId: userId,
      });

      // If game finished, notify everyone
      if (result.gameStatus === 'finished') {
        const updatedGame = await this.gamesService.findOne(gameId);
        this.server.to(`game:${gameId}`).emit('game:finished', {
          gameId,
          winnerId: updatedGame.winnerId,
          players: updatedGame.players.map((p) => ({
            userId: p.userId,
            score: p.score,
            moves: p.moves,
            timeSpent: p.timeSpent,
          })),
        });
      }
    } catch (error) {
      client.emit('game:error', {
        message: error.message || 'Invalid move',
        code: 'MOVE_FAILED',
      });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('game:ready')
  handleReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReadyPayload,
  ) {
    const { gameId } = payload;

    // Notify others that player is ready
    client.to(`game:${gameId}`).emit('game:player_ready', {
      gameId,
      userId: client.data.userId,
    });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('game:leave')
  async handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveGamePayload,
  ) {
    const { gameId } = payload;
    const userId = client.data.userId;

    try {
      await this.gamesService.leaveGame(gameId, userId);

      // Leave Socket.IO room
      client.leave(`game:${gameId}`);
      this.clientGames.delete(client.id);

      const room = this.gameRooms.get(gameId);
      if (room) {
        room.delete(client.id);
        if (room.size === 0) {
          this.gameRooms.delete(gameId);
        }
      }

      // Notify others
      client.to(`game:${gameId}`).emit('game:player_left', {
        gameId,
        userId,
      });
    } catch (error) {
      client.emit('game:error', {
        message: error.message || 'Failed to leave game',
        code: 'LEAVE_FAILED',
      });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('game:start')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { gameId: string },
  ) {
    const { gameId } = payload;
    const userId = client.data.userId;

    try {
      const game = await this.gamesService.startGame(gameId, userId);

      // Broadcast game start
      this.server.to(`game:${gameId}`).emit('game:started', {
        gameId,
        game,
      });

      this.server.to(`game:${gameId}`).emit('game:updated', {
        game,
        players: game?.players || [],
      });
    } catch (error) {
      client.emit('game:error', {
        message: error.message || 'Failed to start game',
        code: 'START_FAILED',
      });
    }
  }
}
