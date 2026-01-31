import React, { useState, useEffect } from 'react';
import { getStats, PlayerStats } from '../../utils/statsManager';
import './PlayerStatsDisplay.css';

const PlayerStatsDisplay: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats>(getStats);

  // Re-read stats when the component mounts or the window refocuses
  useEffect(() => {
    const refresh = () => setStats(getStats());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Also refresh when navigating back to setup (component remounts)
  useEffect(() => {
    setStats(getStats());
  }, []);

  if (stats.gamesPlayed === 0) return null;

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.winsX / stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="player-stats" role="region" aria-label="Player statistics">
      <div className="player-stats__header">Your Stats</div>
      <div className="player-stats__grid">
        <div className="player-stats__item">
          <span className="player-stats__value">{stats.gamesPlayed}</span>
          <span className="player-stats__label">Played</span>
        </div>
        <div className="player-stats__item">
          <span className="player-stats__value player-stats__value--win">{stats.winsX}</span>
          <span className="player-stats__label">Wins (X)</span>
        </div>
        <div className="player-stats__item">
          <span className="player-stats__value">{stats.draws}</span>
          <span className="player-stats__label">Draws</span>
        </div>
        <div className="player-stats__item">
          <span className="player-stats__value">{winRate}%</span>
          <span className="player-stats__label">Win Rate</span>
        </div>
        {stats.bestStreak > 0 && (
          <div className="player-stats__item">
            <span className="player-stats__value player-stats__value--streak">{stats.bestStreak}</span>
            <span className="player-stats__label">Best Streak</span>
          </div>
        )}
      </div>
      {stats.currentStreak >= 2 && (
        <div className="player-stats__streak-banner" aria-live="polite">
          {stats.currentStreak} game win streak!
        </div>
      )}
    </div>
  );
};

export default PlayerStatsDisplay;
