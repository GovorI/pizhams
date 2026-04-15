import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import {
  useGetGameQuery,
  useStartGameMutation,
  useJoinGameMutation,
  useMakeMoveMutation,
  useLeaveGameMutation,
} from '../api/memo.api';
import type { RootState } from '@app/store';
import './MemoGamePage.css';

export const MemoGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const { data: game, isLoading, error, refetch } = useGetGameQuery({ id: id! }, { skip: !id });
  const [startGame] = useStartGameMutation();
  const [joinGame] = useJoinGameMutation();
  const [makeMoveApi] = useMakeMoveMutation();
  const [leaveGame] = useLeaveGameMutation();

  const [isMultiplayer, setIsMultiplayer] = useState(false);

  // WebSocket handlers
  const handleGameUpdated = () => {
    refetch();
  };

  const handleMoveResult = (result: any) => {
    // Handle move result from WebSocket
    if (!result.isMatch) {
      toast('Нет совпадения', { icon: '❌' });
    } else {
      toast('Совпадение!', { icon: '✅' });
    }
  };

  const handleGameFinished = (result: any) => {
    const isWinner = result.winnerId === userId;
    toast(isWinner ? '🎉 Вы победили!' : 'Игра завершена', {
      duration: 5000,
    });
  };

  // WebSocket hook
  const { sendMove, startGame: wsStartGame, leaveGame: wsLeaveGame } = useGameWebSocket({
    gameId: id || null,
    token,
    onGameUpdated: handleGameUpdated,
    onMoveResult: handleMoveResult,
    onGameFinished: handleGameFinished,
  });

  // Game logic hook
  const handleMove = async (card1Id: string, card2Id: string) => {
    if (isMultiplayer) {
      sendMove(card1Id, card2Id);
    } else {
      await makeMoveApi({ id: id!, body: { card1Id, card2Id } });
    }
  };

  const {
    shuffledCards,
    flippedCards,
    matchedCards,
    moves,
    score,
    isProcessing,
    handleCardClick,
  } = useGameLogic(game, handleMove);

  // Join game and auto-start for single player
  useEffect(() => {
    if (!id || !game) return;

    const startSinglePlayerGame = async () => {
      if (game.mode === 'single' && game.status === 'waiting') {
        try {
          await startGame({ id }).unwrap();
          toast.success('Игра началась!');
        } catch (err: any) {
          console.error('Failed to start game:', err);
          toast.error(err?.data?.message || 'Не удалось начать игру');
        }
      }
    };

    // Join the game if waiting (for both single and multiplayer)
    if (game.status === 'waiting') {
      joinGame({ id })
        .unwrap()
        .then(() => {
          // Auto-start only for single player
          if (game.mode === 'single') {
            startSinglePlayerGame();
          }
        })
        .catch((err) => {
          // If already joined (idempotent), that's fine
          if (!err?.data?.message?.includes('already')) {
            console.error('Failed to join game:', err);
          }
        });
    }
  }, [id, game?.id]); // Changed dependency to game.id to run once when game loads

  // Check if multiplayer
  useEffect(() => {
    if (game?.mode === 'multiplayer') {
      setIsMultiplayer(true);
    }
  }, [game?.mode]);

  const handleStartGame = async () => {
    try {
      if (isMultiplayer) {
        wsStartGame();
      } else {
        await startGame({ id: id! }).unwrap();
        toast.success('Игра началась!');
      }
    } catch (err) {
      toast.error('Не удалось начать игру');
    }
  };

  const handleLeaveGame = async () => {
    try {
      if (isMultiplayer) {
        wsLeaveGame();
      } else {
        await leaveGame({ id: id! }).unwrap();
      }
      navigate('/memo');
    } catch (err) {
      toast.error('Не удалось покинуть игру');
    }
  };

  if (isLoading) {
    return <div className="memo-loading">Загрузка игры...</div>;
  }

  if (error || !game) {
    return (
      <div className="memo-error">
        <h2>Игра не найдена</h2>
        <button onClick={() => navigate('/memo')}>Назад к играм</button>
      </div>
    );
  }

  const isMyTurn = game.currentPlayerId === userId;
  const allMatched = shuffledCards.length > 0 && matchedCards.length === shuffledCards.length;
  const isWaiting = game.status === 'waiting' && game.mode === 'multiplayer';

  return (
    <div className="memo-game-page">
      <div className="memo-game-header">
        <h1>{game.cardSet?.name || 'Мемо'}</h1>
        <div className="memo-game-stats">
          <span>Ходы: {moves}</span>
          <span>Очки: {score}</span>
          {game.mode === 'multiplayer' && (
            <span className={isMyTurn ? 'my-turn' : ''}>
              {isMyTurn ? 'Ваш ход' : 'Ожидание...'}
            </span>
          )}
        </div>
        <button className="memo-leave-btn" onClick={handleLeaveGame}>
          Покинуть игру
        </button>
      </div>

      {isWaiting ? (
        <div className="memo-waiting">
          <h2>Ожидание игроков...</h2>
          <div className="memo-players">
            {game.players?.map((player) => (
              <div key={player.id} className="memo-player">
                {player.user?.email || 'Игрок'}
              </div>
            ))}
          </div>
          {game.players?.[0]?.userId === userId && (
            <button className="memo-start-btn" onClick={handleStartGame}>
              Начать игру
            </button>
          )}
        </div>
      ) : (
        <>
          {allMatched && (
            <div className="memo-finished">
              <h2>🎉 Игра завершена!</h2>
              <p>Ходы: {moves} | Очки: {score}</p>
              <button onClick={() => navigate('/memo')}>Назад к играм</button>
            </div>
          )}

          <GameBoard
            cards={shuffledCards}
            flippedCards={flippedCards}
            matchedCards={matchedCards}
            onCardClick={handleCardClick}
            disabled={isProcessing || (isMultiplayer && !isMyTurn)}
            gridRows={game.gridRows}
            gridCols={game.gridCols}
          />
        </>
      )}
    </div>
  );
};
