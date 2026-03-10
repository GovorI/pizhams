import { api } from '@shared/api/api';
import type {
  CardSet,
  Game,
  GameMove,
  CreateCardSetDto,
  CreateCardDto,
  CreateGameDto,
  MakeMoveDto,
  LeaderboardEntry,
  UserStats,
} from './memo.types';

export const memoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Card Sets
    getCardSets: builder.query<CardSet[], { limit?: number }>({
      query: ({ limit = 20 }) => `/memo/card-sets?limit=${limit}`,
      providesTags: ['MemoCardSet'],
    }),

    getMyCardSets: builder.query<CardSet[], void>({
      query: () => '/memo/card-sets/my',
      providesTags: ['MemoCardSet'],
    }),

    getCardSet: builder.query<CardSet, { id: string; includeCards?: boolean }>({
      query: ({ id, includeCards = false }) =>
        `/memo/card-sets/${id}?cards=${includeCards}`,
      providesTags: ['MemoCardSet'],
    }),

    createCardSet: builder.mutation<CardSet, CreateCardSetDto>({
      query: (body) => ({
        url: '/memo/card-sets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MemoCardSet'],
    }),

    updateCardSet: builder.mutation<
      CardSet,
      { id: string; body: Partial<CreateCardSetDto> }
    >({
      query: ({ id, body }) => ({
        url: `/memo/card-sets/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['MemoCardSet'],
    }),

    deleteCardSet: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/memo/card-sets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MemoCardSet'],
    }),

    // Cards
    createCard: builder.mutation<
      CardSet,
      { setId: string; body: CreateCardDto }
    >({
      query: ({ setId, body }) => ({
        url: `/memo/card-sets/${setId}/cards`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MemoCardSet'],
    }),

    updateCard: builder.mutation<
      void,
      { id: string; body: Partial<CreateCardDto> }
    >({
      query: ({ id, body }) => ({
        url: `/memo/cards/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['MemoCardSet'],
    }),

    deleteCard: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/memo/cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MemoCardSet'],
    }),

    // Upload
    uploadCardImage: builder.mutation<
      { url: string },
      { file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/memo/upload',
          method: 'POST',
          body: formData,
          headers: {},
        };
      },
    }),

    // Games
    createGame: builder.mutation<Game, CreateGameDto>({
      query: (body) => ({
        url: '/memo/games',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MemoGame'],
    }),

    getMyGames: builder.query<Game[], { status?: string; limit?: number }>({
      query: ({ status, limit = 20 }) =>
        `/memo/games/my?${status ? `status=${status}` : ''}&limit=${limit}`,
      providesTags: ['MemoGame'],
    }),

    getGame: builder.query<Game, { id: string }>({
      query: ({ id }) => `/memo/games/${id}`,
      providesTags: ['MemoGame'],
    }),

    startGame: builder.mutation<Game, { id: string }>({
      query: ({ id }) => ({
        url: `/memo/games/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['MemoGame'],
    }),

    joinGame: builder.mutation<Game, { id: string }>({
      query: ({ id }) => ({
        url: `/memo/games/${id}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['MemoGame'],
    }),

    leaveGame: builder.mutation<Game | null, { id: string }>({
      query: ({ id }) => ({
        url: `/memo/games/${id}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['MemoGame'],
    }),

    getGameMoves: builder.query<GameMove[], { id: string }>({
      query: ({ id }) => `/memo/games/${id}/moves`,
      providesTags: ['MemoGame'],
    }),

    makeMove: builder.mutation<
      { isMatch: boolean; gameStatus: string; scores: unknown[] },
      { id: string; body: MakeMoveDto }
    >({
      query: ({ id, body }) => ({
        url: `/memo/games/${id}/moves`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MemoGame'],
    }),

    // Leaderboard
    getSingleLeaderboard: builder.query<
      LeaderboardEntry[],
      { period?: string; limit?: number }
    >({
      query: ({ period = 'all', limit = 100 }) =>
        `/memo/leaderboard/single?period=${period}&limit=${limit}`,
      providesTags: ['MemoLeaderboard'],
    }),

    getMultiLeaderboard: builder.query<
      LeaderboardEntry[],
      { period?: string; limit?: number }
    >({
      query: ({ period = 'all', limit = 100 }) =>
        `/memo/leaderboard/multiplayer?period=${period}&limit=${limit}`,
      providesTags: ['MemoLeaderboard'],
    }),

    getUserStats: builder.query<UserStats, { userId: string }>({
      query: ({ userId }) => `/memo/leaderboard/user/${userId}`,
      providesTags: ['MemoLeaderboard'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCardSetsQuery,
  useGetMyCardSetsQuery,
  useGetCardSetQuery,
  useCreateCardSetMutation,
  useUpdateCardSetMutation,
  useDeleteCardSetMutation,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useUploadCardImageMutation,
  useCreateGameMutation,
  useGetMyGamesQuery,
  useGetGameQuery,
  useStartGameMutation,
  useJoinGameMutation,
  useLeaveGameMutation,
  useGetGameMovesQuery,
  useMakeMoveMutation,
  useGetSingleLeaderboardQuery,
  useGetMultiLeaderboardQuery,
  useGetUserStatsQuery,
} = memoApi;
