import React, { KeyboardEvent } from 'react';
import { useGame } from '../../context/GameContext';
import { GameMode, GamePhase } from '../../types';
import './GameModeSelector.css';

/**
 * GameModeSelector component allows users to toggle between basic and extended game modes
 * - Basic mode: Win by getting three in a row in any small grid
 * - Extended mode: Win by winning three small grids in a row on the master grid
 */
const GameModeSelector: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { mode, gamePhase } = gameState;

  /**
   * Handles game mode selection
   * @param selectedMode - The selected game mode
   */
  const handleModeSelect = (selectedMode: GameMode) => {
    if (gamePhase !== GamePhase.SETUP && gamePhase !== GamePhase.FINISHED) {
      return; // Only allow mode switching during setup or after game is finished
    }

    dispatch({ type: 'SET_GAME_MODE', payload: selectedMode });
  };

  /**
   * Handles keyboard events for accessibility
   * @param event - Keyboard event
   * @param selectedMode - The selected game mode
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, selectedMode: GameMode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleModeSelect(selectedMode);
    }
  };

  /**
   * Determines if the component should be disabled
   */
  const isDisabled = gamePhase !== GamePhase.SETUP && gamePhase !== GamePhase.FINISHED;

  return (
    <div 
      className={`game-mode-selector ${isDisabled ? 'game-mode-selector__disabled' : ''}`}
      role="group"
      aria-labelledby="game-mode-title"
    >
      <h3 id="game-mode-title" className="game-mode-selector__title">Game Mode</h3>
      <div 
        className="game-mode-selector__options"
        role="radiogroup"
        aria-label="Select game mode"
      >
        <div
          className={`game-mode-selector__option ${mode === GameMode.BASIC ? 'game-mode-selector__option--selected' : ''}`}
          onClick={() => handleModeSelect(GameMode.BASIC)}
          onKeyDown={(e) => handleKeyDown(e, GameMode.BASIC)}
          role="radio"
          tabIndex={isDisabled ? -1 : 0}
          aria-label="Basic game mode"
          aria-checked={mode === GameMode.BASIC}
          aria-disabled={isDisabled}
        >
          {/* Visual preview: single mini-grid with a winning row highlighted */}
          <div className="game-mode-selector__preview" aria-hidden="true">
            <div className="mode-preview mode-preview--basic">
              <div className="mode-preview__cell mode-preview__cell--x mode-preview__cell--win">X</div>
              <div className="mode-preview__cell mode-preview__cell--x mode-preview__cell--win">X</div>
              <div className="mode-preview__cell mode-preview__cell--x mode-preview__cell--win">X</div>
              <div className="mode-preview__cell">O</div>
              <div className="mode-preview__cell mode-preview__cell--o">O</div>
              <div className="mode-preview__cell"></div>
              <div className="mode-preview__cell"></div>
              <div className="mode-preview__cell"></div>
              <div className="mode-preview__cell mode-preview__cell--o">O</div>
            </div>
            <div className="mode-preview__label">Win here!</div>
          </div>
          <div className="game-mode-selector__option-title">
            Basic
            {mode === GameMode.BASIC && (
              <span className="game-mode-selector__active-indicator" aria-hidden="true">✓</span>
            )}
          </div>
          <div className="game-mode-selector__option-description">
            Win by getting three in a row in any small grid
          </div>
        </div>

        <div
          className={`game-mode-selector__option ${mode === GameMode.EXTENDED ? 'game-mode-selector__option--selected' : ''}`}
          onClick={() => handleModeSelect(GameMode.EXTENDED)}
          onKeyDown={(e) => handleKeyDown(e, GameMode.EXTENDED)}
          role="radio"
          tabIndex={isDisabled ? -1 : 0}
          aria-label="Extended game mode"
          aria-checked={mode === GameMode.EXTENDED}
          aria-disabled={isDisabled}
        >
          {/* Visual preview: master grid showing three won grids in a row */}
          <div className="game-mode-selector__preview" aria-hidden="true">
            <div className="mode-preview mode-preview--extended">
              <div className="mode-preview__grid mode-preview__grid--won-x">X</div>
              <div className="mode-preview__grid mode-preview__grid--won-x">X</div>
              <div className="mode-preview__grid mode-preview__grid--won-x">X</div>
              <div className="mode-preview__grid mode-preview__grid--won-o">O</div>
              <div className="mode-preview__grid"></div>
              <div className="mode-preview__grid"></div>
              <div className="mode-preview__grid"></div>
              <div className="mode-preview__grid mode-preview__grid--won-o">O</div>
              <div className="mode-preview__grid"></div>
            </div>
            <div className="mode-preview__label">Win 3 grids in a row!</div>
          </div>
          <div className="game-mode-selector__option-title">
            Extended
            {mode === GameMode.EXTENDED && (
              <span className="game-mode-selector__active-indicator" aria-hidden="true">✓</span>
            )}
          </div>
          <div className="game-mode-selector__option-description">
            Win by winning three small grids in a row on the master grid
          </div>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
// Only re-render when props or relevant context values change
export default React.memo(GameModeSelector, (prevProps, nextProps) => {
  // Since this component uses context directly and has no props,
  // React.memo won't help much, but we include it for consistency
  // and in case the component is used differently in the future
  return true;
});