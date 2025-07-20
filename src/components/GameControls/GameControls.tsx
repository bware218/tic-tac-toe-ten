import React, { KeyboardEvent } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import './GameControls.css';

/**
 * GameControls component provides buttons for game control actions:
 * - New Game: Resets the game to initial state with mode selection
 * - Reset Game: Resets the current game while keeping settings
 * - Game Mode: Shows current mode and allows switching when game is finished
 */
const GameControls: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { gamePhase, mode } = gameState;

  /**
   * Handles starting a new game (resets everything including settings)
   */
  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };

  /**
   * Handles resetting the current game (keeps current settings)
   */
  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  /**
   * Handles starting the game after setup
   */
  const handleStartGame = () => {
    if (gamePhase === GamePhase.SETUP) {
      dispatch({ type: 'START_GAME' });
    }
  };

  /**
   * Handles keyboard events for accessibility
   * @param event - Keyboard event
   * @param callback - Function to call on key press
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  return (
    <div 
      className="game-controls"
      role="group"
      aria-label="Game controls"
    >
      <div className="game-controls__buttons">
        {gamePhase === GamePhase.SETUP && (
          <button 
            className="game-controls__button game-controls__button--primary"
            onClick={handleStartGame}
            onKeyDown={(e) => handleKeyDown(e, handleStartGame)}
            aria-label="Start game with current settings"
          >
            Start Game
          </button>
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

      {/* Game status information */}
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

// Since GameControls uses context directly, React.memo won't help much
// as it will re-render whenever the context changes
// But we'll add it anyway for consistency and in case the component is used differently in the future
export default React.memo(GameControls);