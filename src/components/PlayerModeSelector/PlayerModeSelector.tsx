import React, { KeyboardEvent } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerMode, GamePhase, CPUDifficulty } from '../../types';
import './PlayerModeSelector.css';

/**
 * PlayerModeSelector component allows users to choose between human-vs-human and human-vs-CPU modes
 * and select CPU difficulty when human-vs-CPU is selected
 */
const PlayerModeSelector: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { playerMode, cpuDifficulty, gamePhase } = gameState;

  /**
   * Handles player mode selection
   * @param selectedMode - The selected player mode
   */
  const handlePlayerModeSelect = (selectedMode: PlayerMode) => {
    if (gamePhase !== GamePhase.SETUP && gamePhase !== GamePhase.FINISHED) {
      return; // Only allow mode switching during setup or after game is finished
    }

    dispatch({ type: 'SET_PLAYER_MODE', payload: selectedMode });
  };

  /**
   * Handles CPU difficulty selection
   * @param selectedDifficulty - The selected CPU difficulty
   */
  const handleDifficultySelect = (selectedDifficulty: CPUDifficulty) => {
    if (gamePhase !== GamePhase.SETUP && gamePhase !== GamePhase.FINISHED) {
      return; // Only allow difficulty switching during setup or after game is finished
    }

    dispatch({ type: 'SET_CPU_DIFFICULTY', payload: selectedDifficulty });
  };

  /**
   * Handles keyboard events for accessibility
   * @param event - Keyboard event
   * @param callback - Function to call on key press
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  /**
   * Determines if the component should be disabled
   */
  const isDisabled = gamePhase !== GamePhase.SETUP && gamePhase !== GamePhase.FINISHED;

  return (
    <div 
      className={`player-mode-selector ${isDisabled ? 'player-mode-selector__disabled' : ''}`}
      role="group"
      aria-labelledby="player-mode-title"
    >
      <h3 id="player-mode-title" className="player-mode-selector__title">Player Mode</h3>
      <div 
        className="player-mode-selector__options"
        role="radiogroup"
        aria-label="Select player mode"
      >
        <div 
          className={`player-mode-selector__option ${playerMode === PlayerMode.HUMAN_VS_HUMAN ? 'player-mode-selector__option--selected' : ''}`}
          onClick={() => handlePlayerModeSelect(PlayerMode.HUMAN_VS_HUMAN)}
          onKeyDown={(e) => handleKeyDown(e, () => handlePlayerModeSelect(PlayerMode.HUMAN_VS_HUMAN))}
          role="radio"
          tabIndex={isDisabled ? -1 : 0}
          aria-label="Human versus human mode"
          aria-checked={playerMode === PlayerMode.HUMAN_VS_HUMAN}
          aria-disabled={isDisabled}
        >
          <div className="player-mode-selector__option-title">
            Human vs Human
            {playerMode === PlayerMode.HUMAN_VS_HUMAN && (
              <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
            )}
          </div>
          <div className="player-mode-selector__option-description">
            Play against another human player
          </div>
        </div>

        <div 
          className={`player-mode-selector__option ${playerMode === PlayerMode.HUMAN_VS_CPU ? 'player-mode-selector__option--selected' : ''}`}
          onClick={() => handlePlayerModeSelect(PlayerMode.HUMAN_VS_CPU)}
          onKeyDown={(e) => handleKeyDown(e, () => handlePlayerModeSelect(PlayerMode.HUMAN_VS_CPU))}
          role="radio"
          tabIndex={isDisabled ? -1 : 0}
          aria-label="Human versus CPU mode"
          aria-checked={playerMode === PlayerMode.HUMAN_VS_CPU}
          aria-disabled={isDisabled}
        >
          <div className="player-mode-selector__option-title">
            Human vs CPU
            {playerMode === PlayerMode.HUMAN_VS_CPU && (
              <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
            )}
          </div>
          <div className="player-mode-selector__option-description">
            Play against the computer
          </div>
        </div>
      </div>

      {/* CPU Difficulty selector - only shown when Human vs CPU is selected */}
      {playerMode === PlayerMode.HUMAN_VS_CPU && (
        <div 
          className="player-mode-selector__difficulty"
          role="group"
          aria-labelledby="cpu-difficulty-title"
        >
          <h4 id="cpu-difficulty-title" className="player-mode-selector__difficulty-title">CPU Difficulty</h4>
          <div 
            className="player-mode-selector__difficulty-options"
            role="radiogroup"
            aria-label="Select CPU difficulty"
          >
            <div 
              className={`player-mode-selector__difficulty-option ${cpuDifficulty === CPUDifficulty.EASY ? 'player-mode-selector__difficulty-option--selected' : ''}`}
              onClick={() => handleDifficultySelect(CPUDifficulty.EASY)}
              onKeyDown={(e) => handleKeyDown(e, () => handleDifficultySelect(CPUDifficulty.EASY))}
              role="radio"
              tabIndex={isDisabled ? -1 : 0}
              aria-label="Easy CPU difficulty"
              aria-checked={cpuDifficulty === CPUDifficulty.EASY}
              aria-disabled={isDisabled}
            >
              <div className="player-mode-selector__difficulty-option-title">
                Easy
                {cpuDifficulty === CPUDifficulty.EASY && (
                  <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
                )}
              </div>
            </div>

            <div 
              className={`player-mode-selector__difficulty-option ${cpuDifficulty === CPUDifficulty.MEDIUM ? 'player-mode-selector__difficulty-option--selected' : ''}`}
              onClick={() => handleDifficultySelect(CPUDifficulty.MEDIUM)}
              onKeyDown={(e) => handleKeyDown(e, () => handleDifficultySelect(CPUDifficulty.MEDIUM))}
              role="radio"
              tabIndex={isDisabled ? -1 : 0}
              aria-label="Medium CPU difficulty"
              aria-checked={cpuDifficulty === CPUDifficulty.MEDIUM}
              aria-disabled={isDisabled}
            >
              <div className="player-mode-selector__difficulty-option-title">
                Medium
                {cpuDifficulty === CPUDifficulty.MEDIUM && (
                  <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
                )}
              </div>
            </div>

            <div 
              className={`player-mode-selector__difficulty-option ${cpuDifficulty === CPUDifficulty.HARD ? 'player-mode-selector__difficulty-option--selected' : ''}`}
              onClick={() => handleDifficultySelect(CPUDifficulty.HARD)}
              onKeyDown={(e) => handleKeyDown(e, () => handleDifficultySelect(CPUDifficulty.HARD))}
              role="radio"
              tabIndex={isDisabled ? -1 : 0}
              aria-label="Hard CPU difficulty"
              aria-checked={cpuDifficulty === CPUDifficulty.HARD}
              aria-disabled={isDisabled}
            >
              <div className="player-mode-selector__difficulty-option-title">
                Hard
                {cpuDifficulty === CPUDifficulty.HARD && (
                  <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
                )}
              </div>
            </div>

            <div 
              className={`player-mode-selector__difficulty-option ${cpuDifficulty === CPUDifficulty.EXPERT ? 'player-mode-selector__difficulty-option--selected' : ''}`}
              onClick={() => handleDifficultySelect(CPUDifficulty.EXPERT)}
              onKeyDown={(e) => handleKeyDown(e, () => handleDifficultySelect(CPUDifficulty.EXPERT))}
              role="radio"
              tabIndex={isDisabled ? -1 : 0}
              aria-label="Expert CPU difficulty"
              aria-checked={cpuDifficulty === CPUDifficulty.EXPERT}
              aria-disabled={isDisabled}
            >
              <div className="player-mode-selector__difficulty-option-title">
                Expert
                {cpuDifficulty === CPUDifficulty.EXPERT && (
                  <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
                )}
              </div>
            </div>
          </div>
          <div 
            className="player-mode-selector__difficulty-description"
            aria-live="polite"
          >
            {cpuDifficulty === CPUDifficulty.EASY && "Random moves - good for beginners"}
            {cpuDifficulty === CPUDifficulty.MEDIUM && "Strategic moves - will try to win and block your wins"}
            {cpuDifficulty === CPUDifficulty.HARD && "Advanced strategy - plans multiple moves ahead"}
            {cpuDifficulty === CPUDifficulty.EXPERT && "Master-level AI - uses opening book, trap setting, and deep analysis"}
          </div>
        </div>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
// Only re-render when props or relevant context values change
export default React.memo(PlayerModeSelector, (prevProps, nextProps) => {
  // Since this component uses context directly and has no props,
  // React.memo won't help much, but we include it for consistency
  // and in case the component is used differently in the future
  return true;
});