import React, { useState } from 'react';
import './HowToPlay.css';

const STEPS = [
  {
    title: 'The Board',
    text: 'The board is a 3x3 grid of mini-grids, making 81 total cells. Each mini-grid is its own tic-tac-toe game.',
    visual: 'board',
  },
  {
    title: 'Make a Move',
    text: 'On your turn, place your mark (X or O) in any open cell. Your first move can go anywhere.',
    visual: 'move',
  },
  {
    title: 'The Constraint',
    text: 'The cell you pick determines which mini-grid your opponent must play in next. Pick cell 5? They play in grid 5.',
    visual: 'constraint',
  },
  {
    title: 'Win!',
    text: 'In Basic mode, get three in a row in any mini-grid to win. In Extended mode, win three mini-grids in a row!',
    visual: 'win',
  },
];

const HowToPlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const current = STEPS[step];

  return (
    <div className="how-to-play">
      <button
        className="how-to-play__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="how-to-play-content"
      >
        {isOpen ? 'Hide Rules' : 'How to Play'}
      </button>

      {isOpen && (
        <div id="how-to-play-content" className="how-to-play__content" role="region" aria-label="How to play guide">
          <div className="how-to-play__step-indicator" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`how-to-play__dot ${i === step ? 'how-to-play__dot--active' : ''}`}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}: ${STEPS[i].title}`}
                aria-current={i === step ? 'step' : undefined}
              />
            ))}
          </div>

          <div className="how-to-play__visual" aria-hidden="true">
            {current.visual === 'board' && <BoardVisual />}
            {current.visual === 'move' && <MoveVisual />}
            {current.visual === 'constraint' && <ConstraintVisual />}
            {current.visual === 'win' && <WinVisual />}
          </div>

          <h4 className="how-to-play__title">{current.title}</h4>
          <p className="how-to-play__text">{current.text}</p>

          <div className="how-to-play__nav">
            <button
              className="how-to-play__nav-btn"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              aria-label="Previous step"
            >
              Back
            </button>
            <span className="how-to-play__step-count">{step + 1} / {STEPS.length}</span>
            <button
              className="how-to-play__nav-btn how-to-play__nav-btn--primary"
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
              aria-label="Next step"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Visual sub-components for each step */

const BoardVisual: React.FC = () => (
  <div className="htp-visual htp-visual--board">
    {Array.from({ length: 9 }).map((_, gi) => (
      <div key={gi} className="htp-mini-grid">
        {Array.from({ length: 9 }).map((_, ci) => (
          <div key={ci} className="htp-cell" />
        ))}
      </div>
    ))}
  </div>
);

const MoveVisual: React.FC = () => (
  <div className="htp-visual htp-visual--board">
    {Array.from({ length: 9 }).map((_, gi) => (
      <div key={gi} className={`htp-mini-grid ${gi === 4 ? 'htp-mini-grid--highlight' : ''}`}>
        {Array.from({ length: 9 }).map((_, ci) => (
          <div key={ci} className={`htp-cell ${gi === 4 && ci === 4 ? 'htp-cell--x htp-cell--pulse' : ''}`}>
            {gi === 4 && ci === 4 ? 'X' : ''}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const ConstraintVisual: React.FC = () => (
  <div className="htp-visual htp-visual--board">
    {Array.from({ length: 9 }).map((_, gi) => (
      <div key={gi} className={`htp-mini-grid ${gi === 7 ? 'htp-mini-grid--constrained' : ''}`}>
        {Array.from({ length: 9 }).map((_, ci) => {
          // Show X's move in grid 4, cell 7 (bottom-center) -> forces opponent to grid 7
          const isXMove = gi === 4 && ci === 7;
          // Show arrow indicator for grid 7
          const isTarget = gi === 7 && ci === 4;
          return (
            <div
              key={ci}
              className={`htp-cell ${isXMove ? 'htp-cell--x' : ''} ${isTarget ? 'htp-cell--target' : ''}`}
            >
              {isXMove ? 'X' : isTarget ? '?' : ''}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

const WinVisual: React.FC = () => (
  <div className="htp-visual htp-visual--board">
    {Array.from({ length: 9 }).map((_, gi) => {
      const isWon = gi === 0 || gi === 1 || gi === 2;
      return (
        <div key={gi} className={`htp-mini-grid ${isWon ? 'htp-mini-grid--won' : ''}`}>
          {Array.from({ length: 9 }).map((_, ci) => (
            <div key={ci} className={`htp-cell ${isWon ? 'htp-cell--won' : ''}`}>
              {isWon ? 'X' : ''}
            </div>
          ))}
        </div>
      );
    })}
  </div>
);

export default HowToPlay;
