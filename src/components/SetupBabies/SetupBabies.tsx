import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { CHARACTERS, BusinessBabyCharacter } from '../BusinessBabies/BusinessBabies';
import { GameMode, PlayerMode, CPUDifficulty } from '../../types';
import './SetupBabies.css';

const SETUP_COMMENTARY = {
  welcome: {
    overconfident: [
      "My analysis indicates you're about to make excellent choices!",
      "Welcome! I've already calculated the optimal settings for you.",
      "Ah, a new challenger approaches! Let me guide your setup.",
    ],
    pessimistic: [
      "Oh great, another game that'll probably end in tears...",
      "Welcome, I guess. Try not to pick the wrong settings.",
      "Here we go again... at least pick wisely this time.",
    ],
    cheerful: [
      "Welcome! I'm SO excited to watch you play!",
      "Yay! A new game is about to begin! Pick your favorite mode!",
      "Hello there! This is going to be amazing!",
    ],
    serious: [
      "Welcome. Please select your configuration carefully.",
      "Initial setup phase. Choose your parameters wisely.",
      "Greetings. Strategic success begins with proper setup.",
    ],
    funny: [
      "Welcome to the fanciest tic-tac-toe you've ever seen!",
      "Step right up! Pick your poison... I mean, game mode!",
      "Fancy meeting you here! Ready to get strategic?",
    ],
    wise: [
      "The journey of a thousand moves begins with a single choice.",
      "Welcome, player. Choose your path with intention.",
      "Every great game starts with mindful preparation.",
    ],
  },
  modeBasic: {
    overconfident: [
      "Basic mode? A fine warm-up for my analytical talents!",
      "Good choice for beginners. I could win this blindfolded!",
    ],
    pessimistic: [
      "Basic mode... at least there's less that can go wrong.",
      "Simpler is probably better. Less room for disaster.",
    ],
    cheerful: [
      "Basic mode is so fun and snappy! Great pick!",
      "Nice! Quick games are the best games!",
    ],
    serious: [
      "Basic mode selected. Focused tactical engagement ahead.",
      "Streamlined ruleset. Efficiency in strategic execution.",
    ],
    funny: [
      "Basic mode! Like tic-tac-toe with a fancy hat!",
      "Keep it simple, keep it classy! I like your style!",
    ],
    wise: [
      "Simplicity is the ultimate sophistication.",
      "In the basic, one finds the essence of the game.",
    ],
  },
  modeExtended: {
    overconfident: [
      "Extended mode! NOW we're playing with real strategy!",
      "Excellent! The superior game mode for superior minds like mine!",
    ],
    pessimistic: [
      "Extended mode? This is going to take forever...",
      "Oh no, the complicated one. Prepare for confusion.",
    ],
    cheerful: [
      "Extended mode! More grids, more fun, more excitement!",
      "Ooh, the full experience! This is going to be epic!",
    ],
    serious: [
      "Extended mode engaged. Multi-layered strategy required.",
      "Full strategic depth activated. Prepare for complex analysis.",
    ],
    funny: [
      "Extended mode! Because regular tic-tac-toe is for amateurs!",
      "Going all in! I respect the ambition!",
    ],
    wise: [
      "The extended path offers the deepest lessons.",
      "Complex challenges forge the strongest strategists.",
    ],
  },
  playerHuman: {
    overconfident: [
      "Human vs human! I'll be judging both of you!",
      "Two humans? My analysis will determine the smarter one!",
    ],
    pessimistic: [
      "Two humans... double the mistakes to watch.",
      "At least the blame can be shared between two people.",
    ],
    cheerful: [
      "Playing with a friend! That's the best way to play!",
      "Human vs human! The classic showdown!",
    ],
    serious: [
      "Head-to-head engagement. Pure strategic competition.",
      "Human opponents. No algorithmic interference.",
    ],
    funny: [
      "Friend vs friend? Remember, it's just a game... right?",
      "Two players enter, one friendship survives! Maybe!",
    ],
    wise: [
      "The greatest opponents teach us the most about ourselves.",
      "In facing another mind, we sharpen our own.",
    ],
  },
  playerCPU: {
    overconfident: [
      "Against the CPU? Bold! My algorithms will be watching!",
      "Human vs machine! The eternal battle!",
    ],
    pessimistic: [
      "Playing against a computer? It doesn't even get tired...",
      "The CPU never makes emotional mistakes. Unlike us.",
    ],
    cheerful: [
      "Taking on the computer! How brave and exciting!",
      "Human vs CPU! May the best player win!",
    ],
    serious: [
      "CPU opponent selected. Prepare for calculated resistance.",
      "Machine adversary engaged. Strategic precision required.",
    ],
    funny: [
      "You vs a robot brain! What could possibly go wrong?",
      "Fighting the machine! Very Terminator of you!",
    ],
    wise: [
      "To face the machine is to face pure logic itself.",
      "The CPU is a mirror that reflects only strategy.",
    ],
  },
  difficultyEasy: {
    overconfident: ["Easy? Even I could beat that! ...Oh wait, I definitely could."],
    pessimistic: ["Easy mode... you'll probably still find a way to lose."],
    cheerful: ["Easy mode! A nice relaxing game ahead!"],
    serious: ["Easy CPU. Minimal resistance expected."],
    funny: ["Easy mode! The CPU will basically be napping!"],
    wise: ["Even the gentlest opponent offers a lesson."],
  },
  difficultyMedium: {
    overconfident: ["Medium? A decent sparring partner for MY standards!"],
    pessimistic: ["Medium difficulty... just enough to be frustrating."],
    cheerful: ["Medium mode! A nice balanced challenge!"],
    serious: ["Medium CPU. Moderate tactical awareness."],
    funny: ["Medium difficulty: not too hot, not too cold!"],
    wise: ["The middle path often leads to the greatest growth."],
  },
  difficultyHard: {
    overconfident: ["Hard mode? Now THIS is worthy of my commentary!"],
    pessimistic: ["Hard mode. I already feel sorry for you."],
    cheerful: ["Hard mode! You're so brave! I believe in you!"],
    serious: ["Hard CPU. Significant strategic challenge ahead."],
    funny: ["Hard mode! Buckle up, buttercup!"],
    wise: ["Through difficulty, mastery is forged."],
  },
  difficultyExpert: {
    overconfident: ["Expert?! Bold choice! Even my algorithms are impressed!"],
    pessimistic: ["Expert mode... it was nice knowing you."],
    cheerful: ["Expert mode! What courage! What determination!"],
    serious: ["Expert CPU. Maximum strategic capacity engaged."],
    funny: ["Expert mode! Do you also enjoy stepping on LEGO?"],
    wise: ["Only by facing the strongest do we discover our true potential."],
  },
};

type SetupCategory = keyof typeof SETUP_COMMENTARY;

function getSetupComment(personality: BusinessBabyCharacter['personality'], category: SetupCategory): string {
  const comments = SETUP_COMMENTARY[category][personality];
  return comments[Math.floor(Math.random() * comments.length)];
}

// Pick 2 characters to show on the setup screen (one from each side)
const SETUP_CHARACTERS = [
  CHARACTERS.find(c => c.id === 'optimist')!,  // Left side - cheerful greeter
  CHARACTERS.find(c => c.id === 'comedian')!,   // Right side - funny commentator
];

const SetupBabies: React.FC = () => {
  const { gameState } = useGame();
  const { mode, playerMode, cpuDifficulty } = gameState;

  const [comments, setComments] = useState<Record<string, string>>({});

  // Initialize with welcome comments
  useEffect(() => {
    const initial: Record<string, string> = {};
    SETUP_CHARACTERS.forEach(char => {
      initial[char.id] = getSetupComment(char.personality, 'welcome');
    });
    setComments(initial);
  }, []);

  // React to game mode changes
  useEffect(() => {
    const category: SetupCategory = mode === GameMode.BASIC ? 'modeBasic' : 'modeExtended';
    const char = SETUP_CHARACTERS[0];
    setComments(prev => ({
      ...prev,
      [char.id]: getSetupComment(char.personality, category),
    }));
  }, [mode]);

  // React to player mode changes
  useEffect(() => {
    const category: SetupCategory = playerMode === PlayerMode.HUMAN_VS_HUMAN ? 'playerHuman' : 'playerCPU';
    const char = SETUP_CHARACTERS[1];
    setComments(prev => ({
      ...prev,
      [char.id]: getSetupComment(char.personality, category),
    }));
  }, [playerMode]);

  // React to difficulty changes
  useEffect(() => {
    if (playerMode !== PlayerMode.HUMAN_VS_CPU) return;
    const categoryMap: Record<string, SetupCategory> = {
      [CPUDifficulty.EASY]: 'difficultyEasy',
      [CPUDifficulty.MEDIUM]: 'difficultyMedium',
      [CPUDifficulty.HARD]: 'difficultyHard',
      [CPUDifficulty.EXPERT]: 'difficultyExpert',
    };
    const category = categoryMap[cpuDifficulty];
    // Update both characters for difficulty since it's a big choice
    const char = SETUP_CHARACTERS[Math.random() > 0.5 ? 0 : 1];
    setComments(prev => ({
      ...prev,
      [char.id]: getSetupComment(char.personality, category),
    }));
  }, [cpuDifficulty, playerMode]);

  return (
    <div className="setup-babies" role="complementary" aria-label="Setup commentators">
      {SETUP_CHARACTERS.map(char => (
        <div
          key={char.id}
          className="setup-baby"
          style={{ '--baby-color': char.color } as React.CSSProperties}
        >
          <div className="setup-baby__avatar" aria-hidden="true">
            <div className={`baby-character ${char.outfit} ${char.accessory}`} />
          </div>
          <div
            className="setup-baby__bubble"
            role="region"
            aria-label={`${char.name} says`}
          >
            <p className="setup-baby__text">{comments[char.id] || '...'}</p>
            <span className="setup-baby__name">{char.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SetupBabies;
