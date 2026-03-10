import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  useGetCardSetsQuery,
  useGetMyCardSetsQuery,
  useCreateCardSetMutation,
  useCreateGameMutation,
} from '../api/memo.api';
import type { RootState } from '@app/store';
import { GameMode, GridSize } from '../api/memo.types';
import './CardSetsPage.css';

export const CardSetsPage: React.FC = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [createCardSet] = useCreateCardSetMutation();
  const [createGame] = useCreateGameMutation();
  const { data: publicSets, isLoading: loadingPublic } = useGetCardSetsQuery({ limit: 20 });
  const { data: mySets, isLoading: loadingMy } = useGetMyCardSetsQuery(undefined, { skip: !token });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createCardSet({
        name: newSetName,
        description: newSetDescription,
        isPublic: true,
      }).unwrap();
      toast.success('Набор карточек создан!');
      setShowCreateModal(false);
      setNewSetName('');
      setNewSetDescription('');
      // Navigate to editor page
      navigate(`/memo/sets/${result.id}/edit`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Не удалось создать набор карточек');
    }
  };

  const handlePlaySet = async (setId: string, mode: GameMode) => {
    try {
      const game = await createGame({
        cardSetId: setId,
        mode,
        gridSize: GridSize.MEDIUM,
      }).unwrap();
      navigate(`/memo/${game.id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Не удалось создать игру');
    }
  };

  return (
    <div className="card-sets-page">
      <div className="card-sets-header">
        <h1>Мемо - Наборы карточек</h1>
        <button className="create-set-btn" onClick={() => setShowCreateModal(true)}>
          + Создать новый набор
        </button>
      </div>

      {token && (
        <section className="card-sets-section">
          <h2>Мои наборы</h2>
          {loadingMy ? (
            <p>Загрузка...</p>
          ) : mySets && mySets.length > 0 ? (
            <div className="card-sets-grid">
              {mySets.map((set) => (
                <div key={set.id} className="card-set-card">
                  <h3>{set.name}</h3>
                  <p>{set.description || 'Нет описания'}</p>
                  <span className="cards-count">{set.cardsCount || 0} карточек</span>
                  <div className="card-set-actions">
                    <button onClick={() => navigate(`/memo/sets/${set.id}/edit`)}>
                      Редактировать
                    </button>
                    <button onClick={() => handlePlaySet(set.id, GameMode.SINGLE)}>
                      Одиночная игра
                    </button>
                    <button onClick={() => handlePlaySet(set.id, GameMode.MULTIPLAYER)}>
                      Мультиплеер
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Вы ещё не создали ни одного набора карточек.</p>
          )}
        </section>
      )}

      <section className="card-sets-section">
        <h2>Публичные наборы</h2>
        {loadingPublic ? (
          <p>Загрузка...</p>
        ) : publicSets && publicSets.length > 0 ? (
          <div className="card-sets-grid">
            {publicSets.map((set) => (
              <div key={set.id} className="card-set-card">
                <h3>{set.name}</h3>
                <p>{set.description || 'Нет описания'}</p>
                <span className="cards-count">{set.cardsCount || 0} карточек</span>
                <div className="card-set-actions">
                  <button onClick={() => handlePlaySet(set.id, GameMode.SINGLE)}>
                    Одиночная игра
                  </button>
                  <button onClick={() => handlePlaySet(set.id, GameMode.MULTIPLAYER)}>
                    Мультиплеер
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Нет публичных наборов карточек.</p>
        )}
      </section>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Создать новый набор карточек</h2>
            <form onSubmit={handleCreateSet}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newSetDescription}
                  onChange={(e) => setNewSetDescription(e.target.value)}
                  maxLength={500}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="primary">
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
