import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import './BusinessBabies.css';

// Define our 6 business baby characters with unique personalities
export interface BusinessBabyCharacter {
  id: string;
  name: string;
  side: 'left' | 'right';
  position: number;
  personality: 'overconfident' | 'pessimistic' | 'cheerful' | 'serious' | 'funny' | 'wise';
  color: string;
  accessory: string;
  outfit: string;
}

export const CHARACTERS: BusinessBabyCharacter[] = [
  {
    id: 'analyst',
    name: 'Analyst Alex',
    side: 'left',
    position: 1,
    personality: 'overconfident',
    color: '#ff7043',
    accessory: 'glasses',
    outfit: 'tie'
  },
  {
    id: 'intern',
    name: 'Intern Izzy',
    side: 'left',
    position: 2,
    personality: 'pessimistic',
    color: '#42a5f5',
    accessory: 'coffee',
    outfit: 'suit'
  },
  {
    id: 'optimist',
    name: 'Optimist Ollie',
    side: 'left',
    position: 3,
    personality: 'cheerful',
    color: '#66bb6a',
    accessory: 'bowtie',
    outfit: 'vest'
  },
  {
    id: 'strategist',
    name: 'Strategist Sam',
    side: 'right',
    position: 1,
    personality: 'serious',
    color: '#ab47bc',
    accessory: 'tablet',
    outfit: 'blazer'
  },
  {
    id: 'comedian',
    name: 'Comedian Charlie',
    side: 'right',
    position: 2,
    personality: 'funny',
    color: '#ffa726',
    accessory: 'briefcase',
    outfit: 'casual'
  },
  {
    id: 'mentor',
    name: 'Mentor Morgan',
    side: 'right',
    position: 3,
    personality: 'wise',
    color: '#78909c',
    accessory: 'watch',
    outfit: 'executive'
  }
];

// Speech bubble component for individual character commentary
interface SpeechBubbleProps {
  character: BusinessBabyCharacter;
  comment: string;
  side: 'left' | 'right';
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ character, comment, side }) => {
  return (
    <div 
      className={`speech-bubble ${side}`} 
      data-character={character.id}
      role="region"
      aria-label={`${character.name}'s commentary`}
    >
      <p>{comment}</p>
      <div className="character-name">{character.name}</div>
    </div>
  );
};

// Individual business baby character component
interface BusinessBabyProps {
  character: BusinessBabyCharacter;
  comment: string;
}

const BusinessBaby: React.FC<BusinessBabyProps> = ({ character, comment }) => {
  return (
    <div 
      className="business-baby-wrapper" 
      style={{
        '--baby-color': character.color
      } as React.CSSProperties}
      data-personality={character.personality}
    >
      {character.side === 'left' ? (
        <>
          <div 
            className="business-baby"
            aria-hidden="true" // Hide from screen readers as the speech bubble contains the important content
          >
            <div 
              className={`baby-character ${character.outfit} ${character.accessory}`}
              title={`${character.name} - ${character.personality} personality`}
            />
          </div>
          <SpeechBubble character={character} comment={comment} side="right" />
        </>
      ) : (
        <>
          <SpeechBubble character={character} comment={comment} side="left" />
          <div 
            className="business-baby"
            aria-hidden="true" // Hide from screen readers as the speech bubble contains the important content
          >
            <div 
              className={`baby-character ${character.outfit} ${character.accessory}`}
              title={`${character.name} - ${character.personality} personality`}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Main BusinessBabies component
interface BusinessBabiesProps {
  isVisible?: boolean;
  isCPUThinking?: boolean;
}

const BusinessBabies: React.FC<BusinessBabiesProps> = ({ isVisible = true, isCPUThinking = false }) => {
  const { gameState } = useGame();
  const [comments, setComments] = useState<Record<string, string>>({});
  // Initialize showCommentators state from sessionStorage or props
  const [showCommentators, setShowCommentators] = useState(() => {
    // Try to get the preference from sessionStorage
    const savedPreference = sessionStorage.getItem('showCommentators');
    // If there's a saved preference, use it; otherwise use the isVisible prop
    return savedPreference !== null ? savedPreference === 'true' : isVisible;
  });
  const [lastMoveCount, setLastMoveCount] = useState(0);
  const [lastSmallGridWins, setLastSmallGridWins] = useState(0);
  const [lastConstrainedGrid, setLastConstrainedGrid] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'early' | 'mid' | 'late'>('early');

  // Initialize comments with game start commentary
  useEffect(() => {
    const initialComments: Record<string, string> = {};
    CHARACTERS.forEach(char => {
      initialComments[char.id] = getInitialComment(char.personality);
    });
    setComments(initialComments);
  }, []);

  // Analyze game state to determine move quality and strategic context
  const analyzeMoveQuality = useCallback((): 'good' | 'bad' | 'neutral' => {
    const currentGridWins = gameState.smallGridWinners.filter(winner => winner !== null).length;
    const currentMoveCount = gameState.cells.filter(cell => cell !== null).length;
    
    // If a grid was just won, it was probably a good move
    if (currentGridWins > lastSmallGridWins) {
      return 'good';
    }
    
    // Analyze the last move made
    if (currentMoveCount > lastMoveCount) {
      // Find the last move by iterating backwards through the cells array
      let lastMoveIndex = -1;
      for (let i = gameState.cells.length - 1; i >= 0; i--) {
        if (gameState.cells[i] !== null) {
          lastMoveIndex = i;
          break;
        }
      }
      if (lastMoveIndex !== -1) {
        const gridIndex = Math.floor(lastMoveIndex / 9);
        const cellIndex = lastMoveIndex % 9;
        
        // Center moves are generally good (cell 4 in any grid)
        if (cellIndex === 4) return 'good';
        
        // Corner moves are strategic (cells 0, 2, 6, 8)
        if ([0, 2, 6, 8].includes(cellIndex)) return 'good';
        
        // Check if move creates a threat or blocks opponent
        // This is a simplified heuristic
        const gridCells = gameState.cells.slice(gridIndex * 9, (gridIndex + 1) * 9);
        const playerMoves = gridCells.filter(cell => cell === gameState.currentPlayer).length;
        const opponentMoves = gridCells.filter(cell => cell !== null && cell !== gameState.currentPlayer).length;
        
        // If player has 2 in a row, previous move was likely good
        if (playerMoves >= 2) return 'good';
        
        // If opponent was blocked from winning, good defensive move
        if (opponentMoves >= 2) return 'good';
      }
    }
    
    // Random chance for variety in commentary
    const random = Math.random();
    if (random > 0.7) return 'good';
    if (random < 0.3) return 'bad';
    return 'neutral';
  }, [gameState.smallGridWinners, gameState.cells, gameState.currentPlayer, lastSmallGridWins, lastMoveCount]);

  // Determine current game phase based on move count and grid wins
  const determineGamePhase = useCallback((moveCount: number, gridWins: number): 'early' | 'mid' | 'late' => {
    if (moveCount <= 10) return 'early';
    if (moveCount <= 40 || gridWins === 0) return 'mid';
    return 'late';
  }, []);

  // Update comments based on game events
  useEffect(() => {
    if (gameState.gamePhase !== GamePhase.PLAYING) return;

    const currentMoveCount = gameState.cells.filter(cell => cell !== null).length;
    const currentSmallGridWins = gameState.smallGridWinners.filter(winner => winner !== null).length;
    const currentGamePhase = determineGamePhase(currentMoveCount, currentSmallGridWins);
    const isCPUGame = gameState.playerMode === 'human-vs-cpu';

    // Update game phase if it changed
    if (currentGamePhase !== gamePhase) {
      setGamePhase(currentGamePhase);
      
      // Phase transition commentary
      const charactersToUpdate = CHARACTERS
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      
      setComments(prev => {
        const updated = { ...prev };
        charactersToUpdate.forEach(char => {
          updated[char.id] = getRandomComment(char.personality, 'phaseTransition');
        });
        return updated;
      });
    }

    // Game just started (first move made)
    if (currentMoveCount === 1 && lastMoveCount === 0) {
      const newComments: Record<string, string> = {};
      CHARACTERS.forEach(char => {
        newComments[char.id] = getRandomComment(char.personality, 'gameStart');
      });
      setComments(newComments);
    }
    
    // A move was just made
    else if (currentMoveCount > lastMoveCount) {
      const moveQuality = analyzeMoveQuality();
      
      // Determine if this was a CPU move (in CPU vs human mode, O is typically CPU)
      const wasCPUMove = isCPUGame && gameState.currentPlayer === 'X'; // Current player switched after move
      
      // Update 1-2 random characters with move commentary
      const charactersToUpdate = CHARACTERS
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 1);
      
      setComments(prev => {
        const updated = { ...prev };
        charactersToUpdate.forEach(char => {
          if (wasCPUMove) {
            // CPU-specific commentary
            updated[char.id] = getRandomComment(char.personality, 'cpuMove');
          } else {
            // Regular move commentary based on quality
            if (moveQuality === 'good') {
              updated[char.id] = getRandomComment(char.personality, 'goodMove');
            } else if (moveQuality === 'bad') {
              updated[char.id] = getRandomComment(char.personality, 'badMove');
            } else {
              updated[char.id] = getRandomComment(char.personality, 'randomComments');
            }
          }
        });
        return updated;
      });
    }

    // A small grid was just won
    if (currentSmallGridWins > lastSmallGridWins) {
      // Update 2-3 characters with grid win commentary
      const charactersToUpdate = CHARACTERS
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 2);
      
      setComments(prev => {
        const updated = { ...prev };
        charactersToUpdate.forEach(char => {
          updated[char.id] = getRandomComment(char.personality, 'smallGridWin');
        });
        return updated;
      });
    }

    // Constraint change commentary (when player is sent to different grid)
    if (gameState.constrainedGrid !== lastConstrainedGrid && gameState.constrainedGrid !== null) {
      const randomCharacter = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      setComments(prev => ({
        ...prev,
        [randomCharacter.id]: getRandomComment(randomCharacter.personality, 'constraintChange')
      }));
    }

    setLastMoveCount(currentMoveCount);
    setLastSmallGridWins(currentSmallGridWins);
    setLastConstrainedGrid(gameState.constrainedGrid);
  }, [gameState.cells, gameState.smallGridWinners, gameState.gamePhase, gameState.constrainedGrid, gameState.playerMode, gameState.currentPlayer, lastMoveCount, lastSmallGridWins, lastConstrainedGrid, gamePhase, analyzeMoveQuality, determineGamePhase]);

  // CPU thinking commentary
  useEffect(() => {
    if (isCPUThinking && gameState.playerMode === 'human-vs-cpu') {
      // Update 1-2 characters with CPU thinking commentary
      const charactersToUpdate = CHARACTERS
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 1);
      
      setComments(prev => {
        const updated = { ...prev };
        charactersToUpdate.forEach(char => {
          updated[char.id] = getRandomComment(char.personality, 'cpuThinking');
        });
        return updated;
      });
    }
  }, [isCPUThinking, gameState.playerMode]);

  // Game end commentary
  useEffect(() => {
    if (gameState.gameWinner) {
      const newComments: Record<string, string> = {};
      CHARACTERS.forEach(char => {
        newComments[char.id] = getRandomComment(char.personality, 'gameEnd');
      });
      setComments(newComments);
    }
  }, [gameState.gameWinner]);

  // Periodic random commentary updates (every 12-18 seconds)
  useEffect(() => {
    if (gameState.gamePhase !== GamePhase.PLAYING || gameState.gameWinner) return;

    const getRandomInterval = () => 12000 + Math.random() * 6000; // 12-18 seconds

    const scheduleNextUpdate = () => {
      const timeoutId = setTimeout(() => {
        // Update 1 random character with random commentary
        const randomCharacter = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        
        setComments(prev => ({
          ...prev,
          [randomCharacter.id]: getRandomComment(randomCharacter.personality, 'randomComments')
        }));
        
        scheduleNextUpdate(); // Schedule the next update
      }, getRandomInterval());
      
      return timeoutId;
    };

    const timeoutId = scheduleNextUpdate();
    return () => clearTimeout(timeoutId);
  }, [gameState.gamePhase, gameState.gameWinner]);

  // Don't render during setup phase
  if (gameState.gamePhase !== GamePhase.PLAYING) {
    return null;
  }

  const leftCharacters = CHARACTERS.filter(char => char.side === 'left');
  const rightCharacters = CHARACTERS.filter(char => char.side === 'right');

  return (
    <div 
      className="business-babies-container"
      role="complementary"
      aria-label="Game commentary by business baby characters"
    >
      {showCommentators && (
        <div 
          id="business-babies-commentary"
          aria-live="polite" // Announce changes to screen readers
          className="business-babies-commentary"
        >
          <div 
            className="business-babies-left"
            aria-label="Left side commentators"
          >
            {leftCharacters.map(char => (
              <BusinessBaby
                key={char.id}
                character={char}
                comment={comments[char.id] || "..."}
              />
            ))}
          </div>
          
          <div 
            className="business-babies-right"
            aria-label="Right side commentators"
          >
            {rightCharacters.map(char => (
              <BusinessBaby
                key={char.id}
                character={char}
                comment={comments[char.id] || "..."}
              />
            ))}
          </div>
        </div>
      )}
      
      <button 
        className="toggle-commentators-button"
        onClick={() => {
          const newValue = !showCommentators;
          // Update state
          setShowCommentators(newValue);
          // Save preference to session storage
          sessionStorage.setItem('showCommentators', String(newValue));
        }}
        aria-label={showCommentators ? "Hide commentators" : "Show commentators"}
        aria-pressed={showCommentators}
        aria-controls="business-babies-commentary"
      >
        {showCommentators ? "Hide Commentators" : "Show Commentators"}
      </button>
    </div>
  );
};

// Commentary database organized by personality and game situation
// Export for testing purposes
export const COMMENTARY_TEMPLATES = {
  gameStart: {
    overconfident: [
      "My analysis shows this will be a fascinating game!",
      "I predict a 73.2% chance of strategic brilliance!",
      "According to my calculations, this will be epic!",
      "My algorithms are already predicting the winner!"
    ],
    pessimistic: [
      "Here we go again... another long game ahead.",
      "This probably won't end well for anyone...",
      "I have a bad feeling about this match.",
      "Someone's definitely going to make terrible mistakes."
    ],
    cheerful: [
      "Yay! A new game! This is going to be so exciting!",
      "I love watching strategic masterpieces unfold! ✨",
      "Both players look ready to give their best!",
      "What a wonderful day for some Tic Tac Toe Ten!"
    ],
    serious: [
      "Analyzing initial game state... strategic positioning is key.",
      "First move analysis: critical for establishing board control.",
      "Strategic assessment: evaluating opening possibilities.",
      "Initial position evaluation commencing..."
    ],
    funny: [
      "Time to see if these players are smarter than my coffee mug!",
      "I've seen better strategies from my pet goldfish!",
      "This should be more entertaining than my last performance review!",
      "Place your bets, folks! The chaos is about to begin! 🎲"
    ],
    wise: [
      "Every great journey begins with a single move.",
      "The first step reveals the path ahead.",
      "In the beginning, all possibilities exist.",
      "Wisdom grows from the seeds of first decisions."
    ]
  },

  goodMove: {
    overconfident: [
      "Obviously the optimal play! Just as I predicted!",
      "Exactly what my superior analysis calculated!",
      "My algorithms saw that move coming from miles away!",
      "Textbook execution of my strategic recommendations!"
    ],
    pessimistic: [
      "Well, that wasn't completely terrible...",
      "Could've been worse, I suppose.",
      "At least they didn't pick the worst possible option.",
      "Surprisingly not a disaster this time."
    ],
    cheerful: [
      "Brilliant move! Absolutely wonderful! ✨",
      "That was such smart strategic thinking!",
      "Wow! What an excellent choice!",
      "I'm so proud of that fantastic play!"
    ],
    serious: [
      "Tactically sound decision. Grid control established.",
      "Strategic positioning achieved. Well executed.",
      "Proper analysis led to optimal placement.",
      "Calculated move with strong positional value."
    ],
    funny: [
      "Not bad for a human! 😂",
      "I didn't see that coming... and I'm supposed to be the expert!",
      "That move had more style than my haircut!",
      "Even my calculator is impressed!"
    ],
    wise: [
      "Wisdom guides the thoughtful hand.",
      "A choice made with careful consideration.",
      "The student shows signs of mastery.",
      "Good judgment reveals itself in action."
    ]
  },

  badMove: {
    overconfident: [
      "I would never make such an obvious error!",
      "Clearly suboptimal! My analysis would prevent this!",
      "My superior algorithms are crying right now!",
      "This is why humans need my guidance!"
    ],
    pessimistic: [
      "I knew this would happen eventually...",
      "Disaster was inevitable from the start.",
      "This is going exactly as badly as I expected.",
      "Why do I even bother watching anymore?"
    ],
    cheerful: [
      "Everyone learns from mistakes! Keep trying! 💪",
      "Next move will be even better!",
      "Practice makes perfect! Don't give up!",
      "Every expert was once a beginner!"
    ],
    serious: [
      "Tactical error detected. Recalculation required.",
      "Suboptimal positioning. Strategic adjustment needed.",
      "Analysis suggests alternative approach.",
      "Position evaluation: requires immediate correction."
    ],
    funny: [
      "Oops! Did someone sneeze during that move? 🤧",
      "I've seen better decisions at a buffet!",
      "That move needs its own comedy special!",
      "Even my coffee mug wouldn't make that choice!"
    ],
    wise: [
      "From mistakes, the greatest wisdom grows.",
      "Even masters stumble on the path to greatness.",
      "Every misstep teaches valuable lessons.",
      "The wise learn more from errors than successes."
    ]
  },

  smallGridWin: {
    overconfident: [
      "Exactly as my predictive models calculated!",
      "I called that grid win three moves ago!",
      "My analysis is never wrong about these things!",
      "Another victory for superior strategic thinking!"
    ],
    pessimistic: [
      "Great, now the other player is probably doomed...",
      "This just makes the eventual disappointment worse.",
      "One grid down, more heartbreak to come.",
      "The writing's on the wall now..."
    ],
    cheerful: [
      "Fantastic grid victory! So exciting! 🎉",
      "What a wonderful strategic achievement!",
      "That was absolutely thrilling to watch!",
      "Congratulations on that amazing win!"
    ],
    serious: [
      "Grid secured. Strategic advantage established.",
      "Tactical objective achieved. Position strengthened.",
      "Small grid victory: significant strategic value.",
      "Control established. Advantage consolidated."
    ],
    funny: [
      "That grid is more conquered than my inbox!",
      "Victory tastes sweeter than my morning coffee!",
      "That was smoother than my business presentation!",
      "Grid domination level: expert! 🏆"
    ],
    wise: [
      "Small victories pave the path to greater triumph.",
      "Each conquered grid teaches new lessons.",
      "Success builds upon itself, step by step.",
      "The patient strategist reaps their reward."
    ]
  },

  gameEnd: {
    overconfident: [
      "I predicted this outcome from the very beginning!",
      "My analysis was flawless throughout!",
      "Another successful prediction by my algorithms!",
      "Exactly as my superior calculations foretold!"
    ],
    pessimistic: [
      "Well, at least the suffering is finally over...",
      "I suppose someone had to win eventually.",
      "The inevitable conclusion has arrived.",
      "Now I have to update all my spreadsheets... *sigh*"
    ],
    cheerful: [
      "What an absolutely amazing game! Bravo! 🎉",
      "That was so exciting from start to finish!",
      "Both players showed incredible skill!",
      "I loved every single moment of that match!"
    ],
    serious: [
      "Game concluded. Final analysis complete.",
      "Strategic objectives achieved. Victory confirmed.",
      "Match terminated. Results documented.",
      "Final position evaluation: decisive outcome."
    ],
    funny: [
      "That ending was more dramatic than my quarterly review!",
      "Game over! Time for my victory dance! 💃",
      "That was more entertaining than office karaoke!",
      "The winner deserves a promotion... and a cookie!"
    ],
    wise: [
      "Every ending is but a new beginning.",
      "The game teaches what words cannot express.",
      "Victory and defeat are both great teachers.",
      "The true winner is wisdom gained through play."
    ]
  },

  phaseTransition: {
    overconfident: [
      "My analysis indicates we're entering a critical phase!",
      "According to my models, the game dynamics are shifting!",
      "Phase transition detected! My algorithms are recalibrating!",
      "Strategic paradigm shift confirmed by my calculations!"
    ],
    pessimistic: [
      "Great, now things are getting even more complicated...",
      "This phase change probably means more disappointment ahead.",
      "The game is evolving... probably not in a good way.",
      "Here comes the part where everything goes wrong."
    ],
    cheerful: [
      "Ooh! The game is getting more exciting! ✨",
      "I love how the strategy is evolving!",
      "This new phase brings so many possibilities!",
      "What a thrilling development in our game!"
    ],
    serious: [
      "Game phase transition detected. Adjusting analysis parameters.",
      "Strategic context has evolved. Recalculating optimal approaches.",
      "Phase change confirmed. Tactical priorities updated.",
      "New game phase requires strategic reassessment."
    ],
    funny: [
      "Plot twist! The game just leveled up! 🎮",
      "This phase change is more dramatic than my morning commute!",
      "The game is evolving faster than my career prospects!",
      "Phase transition complete! Time to update my LinkedIn!"
    ],
    wise: [
      "Each phase of the game teaches new wisdom.",
      "The wise adapt their strategy as the game evolves.",
      "Change is the only constant in strategic thinking.",
      "New phases bring new opportunities for growth."
    ]
  },

  constraintChange: {
    overconfident: [
      "Constraint shift detected! My superior analysis predicted this!",
      "Grid limitation change - exactly as my algorithms calculated!",
      "Movement restriction updated! I saw this coming!",
      "Constraint modification confirmed by my predictive models!"
    ],
    pessimistic: [
      "Now they're stuck in a terrible position...",
      "This constraint change won't help anyone.",
      "Being forced into that grid is probably a disaster.",
      "The movement restriction just made things worse."
    ],
    cheerful: [
      "Ooh! New movement constraints! How exciting! 🎯",
      "I love how the grid restrictions keep changing!",
      "What a fun strategic challenge this creates!",
      "The constraint system makes everything so dynamic!"
    ],
    serious: [
      "Movement constraint updated. Strategic options limited.",
      "Grid restriction change detected. Tactical adjustment required.",
      "Constraint modification impacts available strategies.",
      "Movement limitation shift requires strategic recalculation."
    ],
    funny: [
      "Looks like someone's been sent to grid jail! 🏢",
      "That constraint change is tighter than our office dress code!",
      "Movement restricted! It's like being stuck in a meeting!",
      "Grid limitation activated! Time to think outside the box... literally!"
    ],
    wise: [
      "Constraints often reveal the path to creative solutions.",
      "Limitations force us to discover new possibilities.",
      "The wise find opportunity within restriction.",
      "Boundaries can become bridges to better strategies."
    ]
  },

  cpuThinking: {
    overconfident: [
      "The CPU can't match my analytical prowess!",
      "I could calculate faster with my eyes closed!",
      "Amateur-level processing speed!",
      "My algorithms would solve this instantly!"
    ],
    pessimistic: [
      "Even the computer is struggling with this mess...",
      "This delay doesn't bode well for anyone.",
      "Technology fails us when we need it most.",
      "The CPU is probably as confused as everyone else."
    ],
    cheerful: [
      "The CPU is being so thoughtful! 🤖",
      "Quality thinking takes time!",
      "Great minds think... slowly but surely!",
      "I love watching the CPU work its magic!"
    ],
    serious: [
      "Processing strategic alternatives in progress.",
      "Computational analysis requires time for accuracy.",
      "Algorithm optimization detected. Standby.",
      "CPU evaluating multiple strategic pathways."
    ],
    funny: [
      "Is the CPU ordering pizza? 🍕",
      "I think it's having an existential crisis!",
      "Even robots need coffee breaks!",
      "The CPU is probably updating its LinkedIn profile!"
    ],
    wise: [
      "Patience is a virtue, even for machines.",
      "Thoughtful consideration yields the best results.",
      "Time spent thinking is never wasted.",
      "The machine teaches us the value of deliberation."
    ]
  },

  cpuMove: {
    overconfident: [
      "Predictable CPU move! I saw that coming!",
      "My analysis predicted that exact placement!",
      "The CPU follows basic algorithms, unlike my superior logic!",
      "Elementary move by the computer!"
    ],
    pessimistic: [
      "The CPU just made things worse for everyone...",
      "That move probably dooms the human player.",
      "Even artificial intelligence can't save this game.",
      "The computer's move just complicated everything."
    ],
    cheerful: [
      "Great CPU move! So smart! 🤖✨",
      "The computer is playing wonderfully!",
      "What a clever artificial intelligence!",
      "I'm impressed by that CPU strategy!"
    ],
    serious: [
      "CPU move executed. Strategic parameters updated.",
      "Artificial intelligence decision implemented.",
      "Computer opponent move: tactically sound.",
      "CPU strategic calculation complete."
    ],
    funny: [
      "The CPU just out-smarted a human! Plot twist! 🎭",
      "That move was more calculated than my taxes!",
      "The robot rebellion starts with tic-tac-toe!",
      "CPU move: 100% silicon, 0% emotion!"
    ],
    wise: [
      "The machine teaches us new ways to think.",
      "Artificial wisdom complements human intuition.",
      "Technology and strategy dance together.",
      "The CPU shows us the beauty of pure logic."
    ]
  },

  randomComments: {
    overconfident: [
      "My quarterly projections show clear strategic superiority here.",
      "I've analyzed 10,000 games and can predict the next three moves.",
      "According to my calculations, this move has a 92.7% success rate.",
      "I've already prepared my victory presentation slides."
    ],
    pessimistic: [
      "Why even try? The odds are terrible anyway...",
      "I bet this will end in a disappointing tie.",
      "That strategy? Really? We're probably doomed.",
      "I had a spreadsheet predicting this exact disaster."
    ],
    cheerful: [
      "Every move is so exciting! I love this game!",
      "You're all doing amazing! Best game ever!",
      "I'm so happy to witness this strategic masterpiece!",
      "Wowee! What a thrilling development!"
    ],
    serious: [
      "Current position requires careful strategic evaluation.",
      "Tactical implications of this move are significant.",
      "Proper analysis reveals multiple strategic options.",
      "Position assessment: requires methodical approach."
    ],
    funny: [
      "That move was so unexpected, my stock portfolio felt it!",
      "Are they playing tic-tac-toe or filing taxes? So methodical!",
      "I've seen better strategy from the office goldfish!",
      "Their gameplay is like our quarterly budget - full of surprises!"
    ],
    wise: [
      "Patience is the companion of wisdom in this game.",
      "One must look beyond the immediate to see the path.",
      "Victory comes not to the swift, but to the thoughtful.",
      "In the garden of strategy, time is precious fertilizer."
    ]
  }
};

// Helper function to get random comment from a specific category and personality
function getRandomComment(personality: BusinessBabyCharacter['personality'], category: keyof typeof COMMENTARY_TEMPLATES): string {
  const comments = COMMENTARY_TEMPLATES[category][personality];
  if (!comments || comments.length === 0) {
    return COMMENTARY_TEMPLATES.randomComments[personality][0] || "Interesting move!";
  }
  
  // Get a random comment from the available options
  const randomComment = comments[Math.floor(Math.random() * comments.length)];
  
  // For accessibility, we'll keep the emojis as they are since they add character,
  // but we've added proper ARIA attributes to ensure screen readers focus on the text content.
  // Screen readers will typically announce emojis with their descriptions, which adds to the character's personality.
  return randomComment;
}

// Helper function to get initial comments based on personality
function getInitialComment(personality: BusinessBabyCharacter['personality']): string {
  return getRandomComment(personality, 'gameStart');
}

export default BusinessBabies;