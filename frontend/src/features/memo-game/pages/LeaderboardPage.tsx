import React, { useState } from 'react';
import { useGetSingleLeaderboardQuery, useGetMultiLeaderboardQuery } from '../api/memo.api';
import './LeaderboardPage.css';

export const LeaderboardPage: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'multiplayer'>('single');
  const [period, setPeriod] = useState('all');

  const { data: singleData } = useGetSingleLeaderboardQuery({ period, limit: 100 });
  const { data: multiData } = useGetMultiLeaderboardQuery({ period, limit: 100 });

  const data = mode === 'single' ? singleData : multiData;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label>Mode:</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as 'single' | 'multiplayer')}>
              <option value="single">Single Player</option>
              <option value="multiplayer">Multiplayer</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Period:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="all">All Time</option>
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              {mode === 'single' ? (
                <>
                  <th>Best Time</th>
                  <th>Games Won</th>
                </>
              ) : (
                <>
                  <th>Games Won</th>
                  <th>Win Rate</th>
                  <th>Total Pairs</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((entry, index) => (
                <tr key={entry.userId} className={index < 3 ? `top-${index + 1}` : ''}>
                  <td className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${entry.rank}`}
                  </td>
                  <td className="player">{entry.email || `Player ${entry.userId.slice(0, 8)}`}</td>
                  {mode === 'single' ? (
                    <>
                      <td>{entry.bestTime ? `${entry.bestTime}s` : '-'}</td>
                      <td>{entry.gamesWon || 0}</td>
                    </>
                  ) : (
                    <>
                      <td>{entry.gamesWon || 0}</td>
                      <td>{entry.winRate || '0'}%</td>
                      <td>{entry.totalPairsFound || 0}</td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-data">
                  No data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
