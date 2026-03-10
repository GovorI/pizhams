// Memo Game Types

export enum GameMode {
  SINGLE = 'single',
  MULTIPLAYER = 'multiplayer',
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export enum GridSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge',
  XXLARGE = 'xxlarge',
}

export interface Card {
  id: string;
  cardSetId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface CardSet {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cards?: Card[];
  cardsCount?: number;
}

export interface GamePlayer {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  moves: number;
  timeSpent: number;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface Game {
  id: string;
  cardSetId: string;
  mode: GameMode;
  gridRows: number;
  gridCols: number;
  status: GameStatus;
  currentPlayerId?: string;
  winnerId?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  cardSet?: CardSet;
  players: GamePlayer[];
}

export interface GameMove {
  id: string;
  gameId: string;
  playerId: string;
  card1Id: string;
  card2Id: string;
  isMatch: boolean;
  createdAt: string;
}

export interface UserStats {
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalPairsFound: number;
  totalMoves: number;
  bestTimeSingle: number | null;
  winRate?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  email?: string;
  gamesWon?: number;
  gamesPlayed?: number;
  bestTime?: number;
  winRate?: string;
  totalPairsFound?: number;
}

export interface MoveResult {
  isMatch: boolean;
  gameStatus: GameStatus;
  playerId: string;
  nextPlayerId?: string;
  scores: { playerId: string; score: number }[];
}

export interface CreateCardSetDto {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateCardDto {
  imageUrl: string;
  sortOrder?: number;
}

export interface CreateGameDto {
  cardSetId: string;
  mode: GameMode;
  gridSize?: GridSize;
  gridRows?: number;
  gridCols?: number;
  inviteeIds?: string[];
}

export interface MakeMoveDto {
  card1Id: string;
  card2Id: string;
}
