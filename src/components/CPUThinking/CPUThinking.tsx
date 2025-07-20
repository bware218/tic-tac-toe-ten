import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CPUDifficulty } from '../../types';
import './CPUThinking.css';

interface CPUThinkingProps {
  isThinking: boolean;
}

/**
 * Component to display a CPU thinking indicator with difficulty-based messages
 */
const CPUThinking: React.FC<CPUThinkingProps> = ({ isThinking }) => {
  const { gameState } = useGame();
  const { cpuDifficulty } = gameState;
  const [thinkingMessage, setThinkingMessage] = useState('CPU is thinking...');
  
  // Generate different thinking messages based on CPU difficulty
  useEffect(() => {
    if (!isThinking) return;
    
    const messages = {
      [CPUDifficulty.EASY]: [
        'CPU is picking a move...',
        'CPU is thinking randomly...',
        'CPU is making a simple choice...'
      ],
      [CPUDifficulty.MEDIUM]: [
        'CPU is analyzing the board...',
        'CPU is looking for winning moves...',
        'CPU is planning its strategy...'
      ],
      [CPUDifficulty.HARD]: [
        'CPU is calculating optimal moves...',
        'CPU is evaluating multiple scenarios...',
        'CPU is using advanced strategy...'
      ],
      [CPUDifficulty.EXPERT]: [
        'CPU is performing deep analysis...',
        'CPU is calculating thousands of possibilities...',
        'CPU is using master-level strategy...',
        'CPU is thinking like a grandmaster...'
      ]
    };
    
    // Select a random message based on difficulty
    const difficultyMessages = messages[cpuDifficulty] || messages[CPUDifficulty.MEDIUM];
    const randomIndex = Math.floor(Math.random() * difficultyMessages.length);
    setThinkingMessage(difficultyMessages[randomIndex]);
    
  }, [isThinking, cpuDifficulty]);
  
  // Don't render anything if CPU is not thinking
  if (!isThinking) return null;
  
  return (
    <div 
      className="cpu-thinking" 
      role="status" 
      aria-live="polite"
      aria-label={thinkingMessage}
    >
      <div 
        className={`cpu-thinking-animation cpu-difficulty-${cpuDifficulty.toLowerCase()}`}
        aria-hidden="true"
      >
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <div className="cpu-thinking-text">{thinkingMessage}</div>
    </div>
  );
};

export default CPUThinking;