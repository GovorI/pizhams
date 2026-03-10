import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface UseGameWebSocketOptions {
  gameId: string | null;
  token: string | null;
  onGameUpdated?: (game: unknown) => void;
  onMoveResult?: (result: unknown) => void;
  onGameFinished?: (result: unknown) => void;
  onPlayerJoined?: (data: unknown) => void;
  onPlayerLeft?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

export const useGameWebSocket = ({
  gameId,
  token,
  onGameUpdated,
  onMoveResult,
  onGameFinished,
  onPlayerJoined,
  onPlayerLeft,
  onError,
}: UseGameWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!gameId || !token) {
      return;
    }

    // Initialize socket connection
    socketRef.current = io(`${SOCKET_URL}/memo`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      isConnectedRef.current = true;

      // Join game room
      socketRef.current?.emit('game:join', { gameId });
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      isConnectedRef.current = false;
    });

    socketRef.current.on('game:updated', (data) => {
      console.log('Game updated:', data);
      onGameUpdated?.(data);
    });

    socketRef.current.on('game:move-result', (data) => {
      console.log('Move result:', data);
      onMoveResult?.(data);
    });

    socketRef.current.on('game:finished', (data) => {
      console.log('Game finished:', data);
      onGameFinished?.(data);
    });

    socketRef.current.on('game:player_joined', (data) => {
      console.log('Player joined:', data);
      onPlayerJoined?.(data);
    });

    socketRef.current.on('game:player_left', (data) => {
      console.log('Player left:', data);
      onPlayerLeft?.(data);
    });

    socketRef.current.on('game:started', (data) => {
      console.log('Game started:', data);
      onGameUpdated?.(data);
    });

    socketRef.current.on('game:error', (data) => {
      console.error('Game error:', data);
      onError?.(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('game:leave', { gameId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [gameId, token]);

  const sendMove = useCallback((card1Id: string, card2Id: string) => {
    if (socketRef.current && isConnectedRef.current && gameId) {
      socketRef.current.emit('game:move', {
        gameId,
        card1Id,
        card2Id,
      });
    }
  }, [gameId]);

  const sendReady = useCallback(() => {
    if (socketRef.current && isConnectedRef.current && gameId) {
      socketRef.current.emit('game:ready', { gameId });
    }
  }, [gameId]);

  const startGame = useCallback(() => {
    if (socketRef.current && isConnectedRef.current && gameId) {
      socketRef.current.emit('game:start', { gameId });
    }
  }, [gameId]);

  const leaveGame = useCallback(() => {
    if (socketRef.current && isConnectedRef.current && gameId) {
      socketRef.current.emit('game:leave', { gameId });
    }
  }, [gameId]);

  return {
    isConnected: isConnectedRef.current,
    sendMove,
    sendReady,
    startGame,
    leaveGame,
  };
};
