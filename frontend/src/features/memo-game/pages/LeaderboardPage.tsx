import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetSingleLeaderboardQuery,
  useGetMultiLeaderboardQuery,
} from '../api/memo.api';
import type { LeaderboardEntry } from '../api/memo.types';
import './LeaderboardPage.css';

type LeaderboardMode = 'single' | 'multiplayer';
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LeaderboardMode>('single');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');

  const { data: singleData, isLoading: loadingSingle } = useGetSingleLeaderboardQuery({
    period,
    limit: 100,
  });

  const { data: multiData, isLoading: loadingMulti } = useGetMultiLeaderboardQuery({
    period,
    limit: 100,
  });

  const data = mode === 'single' ? singleData : multiData;
  const isLoading = mode === 'single' ? loadingSingle : loadingMulti;

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button className="back-btn" onClick={() => navigate('/memo')}>
          ← Назад
        </button>
        <h1>🏆 Таблица лидеров</h1>
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label>Режим:</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as LeaderboardMode)}>
              <option value="single">Одиночная</option>
              <option value="multiplayer">Мультиплеер</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Период:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}>
              <option value="daily">Сегодня</option>
              <option value="weekly">Эта неделя</option>
              <option value="monthly">Этот месяц</option>
              <option value="all">За всё время</option>
            </select>
          </div>
        </div>
      </div>

      <div className="leaderboard-table-container">
        {isLoading ? (
          <div className="loading">Загрузка...</div>
        ) : data && data.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Место</th>
                <th>Игрок</th>
                {mode === 'single' ? (
                  <>
                    <th>Лучшее время</th>
                    <th title="Количество выигранных игр">Победы</th>
                    <th title="Общее количество ходов во всех играх">Ходы</th>
                  </>
                ) : (
                  <>
                    <th title="Количество выигранных игр">Победы</th>
                    <th title="Общее количество сыгранных игр">Игры</th>
                    <th>% побед</th>
                    <th title="Общее количество найденных пар">Пары</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((entry: LeaderboardEntry, index: number) => (
                <tr key={entry.userId} className={`rank-${index} ${index < 3 ? 'top-3' : ''}`}>
                  <td className="rank">{getRankIcon(index)}</td>
                  <td className="player">{entry.email || `Игрок ${entry.userId.slice(0, 8)}`}</td>
                  {mode === 'single' ? (
                    <>
                      <td>{entry.bestTime ? `${entry.bestTime} сек` : '—'}</td>
                      <td>{entry.gamesWon || 0}</td>
                      <td>{entry.totalMoves || 0}</td>
                    </>
                  ) : (
                    <>
                      <td>{entry.gamesWon || 0}</td>
                      <td>{entry.gamesPlayed || 0}</td>
                      <td>{entry.winRate || '0'}%</td>
                      <td>{entry.totalPairsFound || 0}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>📊 Пока нет данных</p>
            <p>Станьте первым в таблице лидеров!</p>
          </div>
        )}
      </div>
    </div>
  );
};
