import React, { KeyboardEvent } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerMode, GamePhase, CPUDifficulty } from '../../types';
import './PlayerModeSelector.css';

const DIFFICULTIES = [
  { value: CPUDifficulty.EASY,   label: 'Easy' },
  { value: CPUDifficulty.MEDIUM, label: 'Medium' },
  { value: CPUDifficulty.HARD,   label: 'Hard' },
  { value: CPUDifficulty.EXPERT, label: 'Expert' },
];

const DIFFICULTY_DESCRIPTIONS: Record<CPUDifficulty, string> = {
  [CPUDifficulty.EASY]:   'Random moves - good for beginners',
  [CPUDifficulty.MEDIUM]: 'Strategic moves - will try to win and block your wins',
  [CPUDifficulty.HARD]:   'Advanced strategy - plans multiple moves ahead',
  [CPUDifficulty.EXPERT]: 'Master-level AI - uses opening book, trap setting, and deep analysis',
};

interface DifficultyPickerProps {
  label: string;
  selected: CPUDifficulty;
  isDisabled: boolean;
  onSelect: (d: CPUDifficulty) => void;
  showDescription?: boolean;
  idPrefix: string;
}

const DifficultyPicker: React.FC<DifficultyPickerProps> = ({
  label, selected, isDisabled, onSelect, showDescription = true, idPrefix,
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, value: CPUDifficulty) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isDisabled) onSelect(value);
    }
  };

  return (
    <div className="player-mode-selector__difficulty" role="group" aria-labelledby={`${idPrefix}-title`}>
      <h4 id={`${idPrefix}-title`} className="player-mode-selector__difficulty-title">{label}</h4>
      <div
        className="player-mode-selector__difficulty-options"
        role="radiogroup"
        aria-label={`Select ${label}`}
      >
        {DIFFICULTIES.map(({ value, label: dlabel }) => (
          <div
            key={value}
            className={`player-mode-selector__difficulty-option ${selected === value ? 'player-mode-selector__difficulty-option--selected' : ''}`}
            onClick={() => !isDisabled && onSelect(value)}
            onKeyDown={(e) => handleKeyDown(e, value)}
            role="radio"
            tabIndex={isDisabled ? -1 : 0}
            aria-label={`${dlabel} difficulty`}
            aria-checked={selected === value}
            aria-disabled={isDisabled}
          >
            <div className="player-mode-selector__difficulty-option-title">
              {dlabel}
              {selected === value && (
                <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {showDescription && (
        <div className="player-mode-selector__difficulty-description" aria-live="polite">
          {DIFFICULTY_DESCRIPTIONS[selected]}
        </div>
      )}
    </div>
  );
};

const PlayerModeSelector: React.FC = () => {
  const { gameState, dispatch } = useGame();
  const { playerMode, cpuDifficulty, cpuDifficultyX, gamePhase } = gameState;

  const isDisabled = gamePhase !== GamePhase.SETUP && gamePhase !== GamePhase.FINISHED;

  const handlePlayerModeSelect = (selectedMode: PlayerMode) => {
    if (isDisabled) return;
    dispatch({ type: 'SET_PLAYER_MODE', payload: selectedMode });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  const MODES = [
    {
      mode: PlayerMode.HUMAN_VS_HUMAN,
      title: 'Human vs Human',
      description: 'Play against another human player',
      ariaLabel: 'Human versus human mode',
    },
    {
      mode: PlayerMode.HUMAN_VS_CPU,
      title: 'Human vs CPU',
      description: 'Play against the computer',
      ariaLabel: 'Human versus CPU mode',
    },
    {
      mode: PlayerMode.CPU_VS_CPU,
      title: 'CPU vs CPU',
      description: 'Watch two AIs battle it out',
      ariaLabel: 'CPU versus CPU spectator mode',
    },
  ];

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
        {MODES.map(({ mode, title, description, ariaLabel }) => (
          <div
            key={mode}
            className={`player-mode-selector__option ${playerMode === mode ? 'player-mode-selector__option--selected' : ''}`}
            onClick={() => handlePlayerModeSelect(mode)}
            onKeyDown={(e) => handleKeyDown(e, () => handlePlayerModeSelect(mode))}
            role="radio"
            tabIndex={isDisabled ? -1 : 0}
            aria-label={ariaLabel}
            aria-checked={playerMode === mode}
            aria-disabled={isDisabled}
          >
            <div className="player-mode-selector__option-title">
              {title}
              {playerMode === mode && (
                <span className="player-mode-selector__active-indicator" aria-hidden="true">✓</span>
              )}
            </div>
            <div className="player-mode-selector__option-description">{description}</div>
          </div>
        ))}
      </div>

      {/* Single difficulty picker for Human vs CPU */}
      {playerMode === PlayerMode.HUMAN_VS_CPU && (
        <DifficultyPicker
          label="CPU Difficulty"
          selected={cpuDifficulty}
          isDisabled={isDisabled}
          onSelect={(d) => dispatch({ type: 'SET_CPU_DIFFICULTY', payload: d })}
          showDescription={true}
          idPrefix="cpu-diff"
        />
      )}

      {/* Dual difficulty pickers for CPU vs CPU */}
      {playerMode === PlayerMode.CPU_VS_CPU && (
        <div className="player-mode-selector__dual-difficulty">
          <DifficultyPicker
            label="X Difficulty"
            selected={cpuDifficultyX}
            isDisabled={isDisabled}
            onSelect={(d) => dispatch({ type: 'SET_CPU_DIFFICULTY_X', payload: d })}
            showDescription={false}
            idPrefix="cpu-diff-x"
          />
          <DifficultyPicker
            label="O Difficulty"
            selected={cpuDifficulty}
            isDisabled={isDisabled}
            onSelect={(d) => dispatch({ type: 'SET_CPU_DIFFICULTY', payload: d })}
            showDescription={false}
            idPrefix="cpu-diff-o"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(PlayerModeSelector);
