import React, { KeyboardEvent, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase, GameMode, PlayerMode, CPUDifficulty } from '../../types';
import './GameControls.css';

const LAST_SETTINGS_KEY = 'ttt10-last-settings';

interface SavedSettings {
  mode: GameMode;
  playerMode: PlayerMode;
  cpuDifficulty: CPUDifficulty;
}

function getSavedSettings(): SavedSettings | null {
  try {
    const raw = sessionStorage.getItem(LAST_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSettings;
  } catch {
    return null;
  }
}

function saveSettings(settings: SavedSettings) {
  sessionStorage.setItem(LAST_SETTINGS_KEY, JSON.stringify(settings));
}

const GameControls: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { gamePhase, mode, playerMode, cpuDifficulty } = gameState;

  // Save settings whenever a game starts
  useEffect(() => {
    if (gamePhase === GamePhase.PLAYING) {
      saveSettings({ mode, playerMode, cpuDifficulty });
    }
  }, [gamePhase, mode, playerMode, cpuDifficulty]);

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };

  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const handleStartGame = () => {
    if (gamePhase === GamePhase.SETUP) {
      dispatch({ type: 'START_GAME' });
    }
  };

  const handleQuickPlay = () => {
    const saved = getSavedSettings();
    if (!saved || gamePhase !== GamePhase.SETUP) return;
    dispatch({ type: 'SET_GAME_MODE', payload: saved.mode });
    dispatch({ type: 'SET_PLAYER_MODE', payload: saved.playerMode });
    dispatch({ type: 'SET_CPU_DIFFICULTY', payload: saved.cpuDifficulty });
    dispatch({ type: 'START_GAME' });
  };

  const savedSettings = getSavedSettings();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  const formatQuickPlayLabel = (s: SavedSettings): string => {
    const modeLabel = s.mode === GameMode.BASIC ? 'Basic' : 'Extended';
    if (s.playerMode === PlayerMode.HUMAN_VS_HUMAN) {
      return `${modeLabel}, vs Human`;
    }
    const diffLabel = s.cpuDifficulty.charAt(0).toUpperCase() + s.cpuDifficulty.slice(1);
    return `${modeLabel}, vs CPU (${diffLabel})`;
  };

  return (
    <div
      className="game-controls"
      role="group"
      aria-label="Game controls"
    >
      <div className="game-controls__buttons">
        {gamePhase === GamePhase.SETUP && (
          <>
            <button
              className="game-controls__button game-controls__button--primary"
              onClick={handleStartGame}
              onKeyDown={(e) => handleKeyDown(e, handleStartGame)}
              aria-label="Start game with current settings"
            >
              Start Game
            </button>
            {savedSettings && (
              <button
                className="game-controls__button game-controls__button--quick"
                onClick={handleQuickPlay}
                onKeyDown={(e) => handleKeyDown(e, handleQuickPlay)}
                aria-label={`Quick play with last settings: ${formatQuickPlayLabel(savedSettings)}`}
              >
                Quick Play
                <span className="game-controls__quick-label">
                  {formatQuickPlayLabel(savedSettings)}
                </span>
              </button>
            )}
          </>
        )}

        {gamePhase === GamePhase.PLAYING && (
          <button
            className="game-controls__button game-controls__button--secondary"
            onClick={handleResetGame}
            onKeyDown={(e) => handleKeyDown(e, handleResetGame)}
            aria-label="Reset current game"
          >
            Reset Game
          </button>
        )}

        {gamePhase === GamePhase.FINISHED && (
          <>
            <button
              className="game-controls__button game-controls__button--primary"
              onClick={handleResetGame}
              onKeyDown={(e) => handleKeyDown(e, handleResetGame)}
              aria-label="Play again with same settings"
            >
              Play Again
            </button>
            <button
              className="game-controls__button game-controls__button--secondary"
              onClick={handleNewGame}
              onKeyDown={(e) => handleKeyDown(e, handleNewGame)}
              aria-label="Start new game with different settings"
            >
              New Game
            </button>
          </>
        )}
      </div>

      <div
        className="game-controls__info"
        aria-live="polite"
      >
        {gamePhase === GamePhase.PLAYING && (
          <div className="game-controls__status">
            <span
              className="game-controls__status-label"
              id="game-status-label"
            >
              Game in progress
            </span>
            <button
              className="game-controls__button game-controls__button--text"
              onClick={handleNewGame}
              onKeyDown={(e) => handleKeyDown(e, handleNewGame)}
              aria-label="Abandon current game and start new game"
              aria-describedby="game-status-label"
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(GameControls);
