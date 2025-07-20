import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Player, GamePhase } from '../../types';
import './GameCommentary.css';

// Character definitions with personalities
const CHARACTERS = [
  {
    id: 'analyst',
    name: 'Alex',
    role: 'Overconfident Analyst',
    side: 'left',
    sprite: '👔',
    personality: 'overconfident'
  },
  {
    id: 'intern',
    name: 'Sam',
    role: 'Pessimistic Intern',
    side: 'left',
    sprite: '🤓',
    personality: 'pessimistic'
  },
  {
    id: 'optimist',
    name: 'Riley',
    role: 'Cheerful Optimist',
    side: 'left',
    sprite: '😊',
    personality: 'optimistic'
  },
  {
    id: 'strategist',
    name: 'Morgan',
    role: 'Serious Strategist',
    side: 'right',
    sprite: '🧐',
    personality: 'serious'
  },
  {
    id: 'comedian',
    name: 'Casey',
    role: 'The Comedian',
    side: 'right',
    sprite: '😄',
    personality: 'funny'
  },
  {
    id: 'mentor',
    name: 'Jordan',
    role: 'Wise Mentor',
    side: 'right',
    sprite: '👴',
    personality: 'wise'
  }
];

// Commentary database organized by personality and situation
const COMMENTARY = {
  gameStart: {
    overconfident: ["I predict X will dominate this match!", "My analysis shows X has a 73% win probability!", "X's opening strategy is clearly superior!"],
    pessimistic: ["This won't end well for anyone...", "I have a bad feeling about this game", "Someone's going to make a terrible mistake soon"],
    optimistic: ["What an exciting game ahead! 🌟", "Both players look fantastic today!", "I believe in everyone's potential!"],
    serious: ["Analyzing opening positions...", "Strategic considerations are paramount", "The first move sets the entire tone"],
    funny: ["Place your bets, folks! 🎲", "I've seen better strategies from my pet goldfish!", "This should be more entertaining than my last performance review!"],
    wise: ["Every master was once a beginner", "The game reveals character", "Patience and strategy will prevail"]
  },
  
  goodMove: {
    overconfident: ["Obviously the optimal play!", "Exactly what I predicted!", "My calculations were spot on!"],
    pessimistic: ["Well, that wasn't completely terrible", "Could've been worse, I suppose", "At least they didn't pick the worst option"],
    optimistic: ["Brilliant move! ✨", "That was absolutely wonderful!", "Such strategic thinking!"],
    serious: ["Tactically sound decision", "Proper grid control established", "Strategic positioning achieved"],
    funny: ["Not bad for a human! 😂", "I didn't see that coming... and I'm supposed to be the expert!", "That move had more style than my haircut!"],
    wise: ["Wisdom guides the hand", "A thoughtful choice indeed", "The student becomes the teacher"]
  },
  
  badMove: {
    overconfident: ["I would never make such an error!", "Clearly suboptimal play!", "My superior analysis would prevent this!"],
    pessimistic: ["I knew this would happen", "Disaster was inevitable", "This is going exactly as badly as expected"],
    optimistic: ["Everyone learns from mistakes! 💪", "Next move will be better!", "Practice makes perfect!"],
    serious: ["Tactical error detected", "Suboptimal positioning", "Strategic recalculation required"],
    funny: ["Oops! Did someone sneeze during that move? 🤧", "I've seen better decisions at a buffet!", "That move needs its own comedy special!"],
    wise: ["From mistakes, wisdom grows", "Even masters stumble", "The path to mastery has many turns"]
  },
  
  predictions: {
    overconfident: ["X will win in exactly 7 moves!", "My algorithms never lie - O is doomed!", "I've calculated every possible outcome!"],
    pessimistic: ["Everyone's going to lose somehow", "This will probably end in tears", "I predict disappointment for all"],
    optimistic: ["Both players are doing amazingly!", "What a close and exciting match!", "Everyone's a winner in my book! 🏆"],
    serious: ["Current probability favors X", "Strategic advantage shifts to O", "Position evaluation: inconclusive"],
    funny: ["My crystal ball is in the shop, so... ¯\\_(ツ)_/¯", "I predict someone will win... eventually!", "Plot twist: the grid wins!"],
    wise: ["The outcome reveals itself in time", "Victory belongs to the persistent", "The game teaches what words cannot"]
  },
  
  cpuThinking: {
    overconfident: ["The CPU can't match my analytical prowess!", "I could calculate faster with my eyes closed!", "Amateur-level processing speed!"],
    pessimistic: ["Even the computer is struggling", "This delay doesn't bode well", "Technology fails us again"],
    optimistic: ["The CPU is being so thoughtful! 🤖", "Quality thinking takes time!", "Great minds think... slowly!"],
    serious: ["Processing strategic alternatives", "Computational analysis in progress", "Algorithm optimization detected"],
    funny: ["Is the CPU ordering pizza? 🍕", "I think it's having an existential crisis!", "Even robots need coffee breaks!"],
    wise: ["Patience is a virtue, even for machines", "Thoughtful consideration yields wisdom", "Time spent thinking is never wasted"]
  }
};

interface GameCommentaryProps {
  className?: string;
}

const GameCommentary: React.FC<GameCommentaryProps> = ({ className = '' }) => {
  const { gameState } = useGame();
  const [activeComments, setActiveComments] = useState<{[key: string]: string}>({});
  const [lastMoveCount, setLastMoveCount] = useState(0);
  
  // Get random comment for a character based on situation
  const getRandomComment = (personality: string, situation: string): string => {
    const situationComments = COMMENTARY[situation as keyof typeof COMMENTARY];
    const comments = situationComments?.[personality as keyof typeof situationComments] || COMMENTARY.predictions[personality as keyof typeof COMMENTARY.predictions];
    return comments[Math.floor(Math.random() * comments.length)];
  };
  
  // Update comments based on game state
  useEffect(() => {
    const currentMoveCount = gameState.cells.filter(cell => cell !== null).length;
    
    // Game start comments
    if (gameState.gamePhase === GamePhase.PLAYING && currentMoveCount === 1 && lastMoveCount === 0) {
      const newComments: {[key: string]: string} = {};
      CHARACTERS.forEach(char => {
        newComments[char.id] = getRandomComment(char.personality, 'gameStart');
      });
      setActiveComments(newComments);
    }
    
    setLastMoveCount(currentMoveCount);
  }, [gameState.cells, gameState.gamePhase, lastMoveCount]);
  
  // Timer-based commentary updates (every 15 seconds)
  useEffect(() => {
    if (gameState.gamePhase !== GamePhase.PLAYING) return;
    
    const interval = setInterval(() => {
      const situations = ['predictions', 'goodMove', 'badMove'];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      
      // Update 1-2 random characters
      const charactersToUpdate = CHARACTERS
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 1);
      
      setActiveComments(prev => {
        const updated = { ...prev };
        charactersToUpdate.forEach(char => {
          updated[char.id] = getRandomComment(char.personality, randomSituation);
        });
        return updated;
      });
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [gameState.gamePhase]);
  
  // Don't render during setup phase
  if (gameState.gamePhase === GamePhase.SETUP) {
    return null;
  }
  
  const leftCharacters = CHARACTERS.filter(char => char.side === 'left');
  const rightCharacters = CHARACTERS.filter(char => char.side === 'right');
  
  return (
    <div className={`game-commentary ${className}`}>
      {/* Left side characters */}
      <div className="commentary-side commentary-left">
        {leftCharacters.map((character, index) => (
          <div key={character.id} className={`character character-${character.personality}`}>
            <div className="character-sprite">
              <div className="pixel-character">
                <div className="character-head">{character.sprite}</div>
                <div className="character-body">
                  <div className="business-suit">👔</div>
                </div>
              </div>
            </div>
            <div className="character-info">
              <div className="character-name">{character.name}</div>
              <div className="character-role">{character.role}</div>
            </div>
            {activeComments[character.id] && (
              <div className="speech-bubble speech-bubble-right">
                <div className="bubble-content">
                  {activeComments[character.id]}
                </div>
                <div className="bubble-arrow"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Right side characters */}
      <div className="commentary-side commentary-right">
        {rightCharacters.map((character, index) => (
          <div key={character.id} className={`character character-${character.personality}`}>
            {activeComments[character.id] && (
              <div className="speech-bubble speech-bubble-left">
                <div className="bubble-content">
                  {activeComments[character.id]}
                </div>
                <div className="bubble-arrow"></div>
              </div>
            )}
            <div className="character-info">
              <div className="character-name">{character.name}</div>
              <div className="character-role">{character.role}</div>
            </div>
            <div className="character-sprite">
              <div className="pixel-character">
                <div className="character-head">{character.sprite}</div>
                <div className="character-body">
                  <div className="business-suit">👔</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameCommentary;