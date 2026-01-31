/**
 * Player statistics manager using localStorage.
 */

const STATS_KEY = 'ttt10-player-stats';

export interface PlayerStats {
  gamesPlayed: number;
  winsX: number;
  winsO: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  lastResult: 'win' | 'loss' | 'draw' | null;
}

function defaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    winsX: 0,
    winsO: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastResult: null,
  };
}

export function getStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

function saveStats(stats: PlayerStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordGameResult(winner: 'X' | 'O' | null) {
  const stats = getStats();
  stats.gamesPlayed++;

  if (winner === 'X') {
    stats.winsX++;
    stats.lastResult = 'win';
    stats.currentStreak++;
  } else if (winner === 'O') {
    stats.winsO++;
    stats.lastResult = 'loss';
    stats.currentStreak = 0;
  } else {
    stats.draws++;
    stats.lastResult = 'draw';
    stats.currentStreak = 0;
  }

  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak;
  }

  saveStats(stats);
}

export function resetStats() {
  localStorage.removeItem(STATS_KEY);
}
