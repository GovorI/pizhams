import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  useGetWaitingGamesQuery,
  useCreateGameMutation,
  useJoinGameMutation,
} from '../api/memo.api';
import type { RootState } from '@app/store';
import { GameMode, GridSize } from '../api/memo.types';
import './MultiplayerPage.css';

export const MultiplayerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const cardSetId = searchParams.get('cardSetId') || undefined;

  const [createGame] = useCreateGameMutation();
  const [joinGame] = useJoinGameMutation();

  const { data: waitingGames, isLoading, refetch } = useGetWaitingGamesQuery(
    { cardSetId, limit: 50 },
    { skip: !token, refetchOnMountOrArgChange: 5 }, // Refetch every 5 seconds
  );

  const handleCreateNewGame = async () => {
    if (!cardSetId) {
      toast.error('Выберите набор карточек');
      return;
    }
    try {
      const game = await createGame({
        cardSetId,
        mode: GameMode.MULTIPLAYER,
        gridSize: GridSize.MEDIUM,
      }).unwrap();
      toast.success('Игра создана! Ожидание игроков...');
      navigate(`/memo/${game.id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Не удалось создать игру');
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const game = await joinGame({ id: gameId }).unwrap();
      toast.success('Вы присоединились к игре!');
      navigate(`/memo/${gameId}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Не удалось присоединиться');
    }
  };

  // Filter out games where current user is already a player
  const availableGames = waitingGames?.filter(
    (game) => !game.players?.some((p) => p.userId === userId),
  ) || [];

  // Games where user is already a player (waiting to start)
  const myWaitingGames = waitingGames?.filter(
    (game) => game.players?.some((p) => p.userId === userId),
  ) || [];

  if (!token) {
    return (
      <div className="multiplayer-page">
        <div className="multiplayer-error">
          <h2>Необходима авторизация</h2>
          <button onClick={() => navigate('/login')}>Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="multiplayer-page">
      <div className="multiplayer-header">
        <button className="back-btn" onClick={() => navigate('/memo')}>
          ← Назад
        </button>
        <h1>🎮 Мультиплеер</h1>
        <button className="refresh-btn" onClick={() => refetch()}>
          🔄 Обновить
        </button>
      </div>

      {/* My waiting games */}
      {myWaitingGames.length > 0 && (
        <section className="multiplayer-section">
          <h2> Мои ожидающие игры</h2>
          <p className="section-hint">Нажмите чтобы продолжить ожидание или начать</p>
          <div className="games-list">
            {myWaitingGames.map((game) => (
              <div key={game.id} className="game-card my-game">
                <div className="game-info">
                  <h3>{game.cardSet?.name || 'Набор карточек'}</h3>
                  <div className="game-meta">
                    <span className="grid-size">
                      {game.gridRows}×{game.gridCols}
                    </span>
                    <span className="players-count">
                      👥 {game.players?.length || 0} игроков
                    </span>
                  </div>
                </div>
                <div className="game-players">
                  {game.players?.map((player) => (
                    <span key={player.id} className="player-badge">
                      {player.user?.email?.split('@')[0] || 'Игрок'}
                    </span>
                  ))}
                </div>
                <button
                  className="join-btn"
                  onClick={() => navigate(`/memo/${game.id}`)}
                >
                  Войти в игру →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available games to join */}
      <section className="multiplayer-section">
        <h2> Ожидающие игры</h2>
        <p className="section-hint">
          {cardSetId
            ? `Игры для набора "${cardSetId}"`
            : 'Все доступные игры для подключения'}
        </p>

        {isLoading ? (
          <p className="loading">Загрузка...</p>
        ) : availableGames.length > 0 ? (
          <div className="games-list">
            {availableGames.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-info">
                  <h3>{game.cardSet?.name || 'Набор карточек'}</h3>
                  <div className="game-meta">
                    <span className="grid-size">
                      {game.gridRows}×{game.gridCols}
                    </span>
                    <span className="players-count">
                      👥 {game.players?.length || 0} / 6 игроков
                    </span>
                  </div>
                </div>
                <div className="game-players">
                  {game.players?.map((player) => (
                    <span key={player.id} className="player-badge">
                      {player.user?.email?.split('@')[0] || 'Игрок'}
                      {player.userId === game.players?.[0]?.userId && ' (хост)'}
                    </span>
                  ))}
                </div>
                <button
                  className="join-btn"
                  onClick={() => handleJoinGame(game.id)}
                >
                  Подключиться
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-games">
            <p>Нет ожидающих игр</p>
            {cardSetId && (
              <button className="create-btn" onClick={handleCreateNewGame}>
                + Создать новую игру для этого набора
              </button>
            )}
          </div>
        )}
      </section>

      {!cardSetId && (
        <section className="multiplayer-section">
          <h2>💡 Как играть</h2>
          <div className="how-to-play">
            <ol>
              <li>Перейдите в <strong>Наборы карточек</strong></li>
              <li>Выберите набор и нажмите <strong>Мультиплеер</strong></li>
              <li>Создайте игру или присоединитесь к существующей</li>
              <li>Ожидайте других игроков и начните игру</li>
            </ol>
          </div>
        </section>
      )}
    </div>
  );
};
