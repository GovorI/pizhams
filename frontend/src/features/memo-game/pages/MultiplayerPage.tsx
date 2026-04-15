import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  useGetWaitingGamesQuery,
  useCreateGameMutation,
  useJoinGameMutation,
  useGetMyCardSetsQuery,
} from '../api/memo.api';
import type { RootState } from '@app/store';
import { GameMode, GridSize } from '../api/memo.types';
import './MultiplayerPage.css';

export const MultiplayerPage: React.FC = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [createGame] = useCreateGameMutation();
  const [joinGame] = useJoinGameMutation();

  const { data: waitingGames, isLoading, refetch } = useGetWaitingGamesQuery(
    { limit: 50 },
    { skip: !token, refetchOnMountOrArgChange: 5 },
  );

  const { data: myCardSets } = useGetMyCardSetsQuery(undefined, { skip: !token });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCardSetId, setSelectedCardSetId] = useState<string>('');

  const handleCreateGame = async () => {
    if (!selectedCardSetId) {
      toast.error('Выберите набор карточек');
      return;
    }
    try {
      const game = await createGame({
        cardSetId: selectedCardSetId,
        mode: GameMode.MULTIPLAYER,
        gridSize: GridSize.MEDIUM,
      }).unwrap();
      toast.success('Игра создана!');
      setShowCreateModal(false);
      setSelectedCardSetId('');
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

  // Games where current user is already a player
  const myWaitingGames = waitingGames?.filter(
    (game) => game.players?.some((p) => p.userId === userId),
  ) || [];

  // Games where current user is NOT a player
  const availableGames = waitingGames?.filter(
    (game) => !game.players?.some((p) => p.userId === userId),
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
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => refetch()}>
            🔄 Обновить
          </button>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            + Создать игру
          </button>
        </div>
      </div>

      {/* My waiting games */}
      {myWaitingGames.length > 0 && (
        <section className="multiplayer-section">
          <h2> Мои игры</h2>
          <p className="section-hint">Нажмите чтобы вернуться в комнату ожидания</p>
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
                      👥 {game.players?.length || 0} / 6 игроков
                    </span>
                  </div>
                </div>
                <div className="game-players">
                  {game.players?.map((player) => (
                    <span
                      key={player.id}
                      className={`player-badge ${player.userId === userId ? 'me' : ''}`}
                    >
                      {player.user?.email?.split('@')[0] || 'Игрок'}
                      {player.userId === userId && ' (вы)'}
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
        <h2>🌍 Доступные игры</h2>
        <p className="section-hint">Присоединяйтесь к играм других игроков</p>

        {isLoading ? (
          <p className="loading">Загрузка...</p>
        ) : availableGames.length > 0 ? (
          <div className="games-list">
            {availableGames.map((game) => {
              const creator = game.players?.[0];
              return (
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
                    {creator && (
                      <p className="game-creator">
                        Создатель: <strong>{creator.user?.email?.split('@')[0] || 'Игрок'}</strong>
                      </p>
                    )}
                  </div>
                  <div className="game-players">
                    {game.players?.map((player) => (
                      <span key={player.id} className="player-badge">
                        {player.user?.email?.split('@')[0] || 'Игрок'}
                        {player.userId === creator?.userId && ' (хост)'}
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
              );
            })}
          </div>
        ) : (
          <div className="no-games">
            <p>Нет доступных игр</p>
            <p className="no-games-hint">Создайте свою игру и ожидайте игроков!</p>
            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
              + Создать игру
            </button>
          </div>
        )}
      </section>

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Создать мультиплеер игру</h2>
            <p className="modal-hint">Выберите набор карточек для игры</p>

            {myCardSets && myCardSets.length > 0 ? (
              <div className="cardset-list">
                {myCardSets.map((cardSet) => (
                  <button
                    key={cardSet.id}
                    className={`cardset-item ${selectedCardSetId === cardSet.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCardSetId(cardSet.id)}
                  >
                    <span className="cardset-name">{cardSet.name}</span>
                    <span className="cardset-cards">{cardSet.cardsCount || 0} карточек</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-cardsets">
                <p>У вас нет наборов карточек</p>
                <button onClick={() => { setShowCreateModal(false); navigate('/memo'); }}>
                  Создать набор
                </button>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={() => setShowCreateModal(false)}>
                Отмена
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleCreateGame}
                disabled={!selectedCardSetId}
              >
                Создать игру
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
