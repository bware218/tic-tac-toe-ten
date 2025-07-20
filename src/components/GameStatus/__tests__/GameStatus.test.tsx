import React from 'react';
import { render, screen } from '@testing-library/react';
import GameStatus from '../GameStatus';
import { GameProvider } from '../../../context/GameContext';
import { GameMode, GamePhase, Player, PlayerMode } from '../../../types';

// Mock the game context
jest.mock('../../../context/GameContext', () => {
  const originalModule = jest.requireActual('../../../context/GameContext');
  
  return {
    ...originalModule,
    useGame: jest.fn()
  };
});

// Import the mocked useGame
import { useGame } from '../../../context/GameContext';

describe('GameStatus Component', () => {
  // Helper function to setup the mock game state
  const setupGameState = (customState = {}) => {
    const defaultState = {
      mode: GameMode.BASIC,
      playerMode: PlayerMode.HUMAN_VS_HUMAN,
      currentPlayer: Player.X,
      gamePhase: GamePhase.PLAYING,
      firstMove: false,
      constrainedGrid: 4, // Middle grid
      cells: new Array(81).fill(null),
      smallGridWinners: new Array(9).fill(null),
      gameWinner: null,
      winningCells: [],
    };

    (useGame as jest.Mock).mockReturnValue({
      gameState: { ...defaultState, ...customState },
      dispatch: jest.fn()
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders player turn information', () => {
    setupGameState({ currentPlayer: Player.X });
    
    render(
      <GameProvider>
        <GameStatus />
      </GameProvider>
    );
    
    expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
  });

  test('renders constraint information for specific grid', () => {
    setupGameState({ constrainedGrid: 4 });
    
    render(
      <GameProvider>
        <GameStatus />
      </GameProvider>
    );
    
    expect(screen.getByText(/You must play in grid 5/i)).toBeInTheDocument();
  });

  test('renders free choice information when no grid is constrained', () => {
    setupGameState({ constrainedGrid: null });
    
    render(
      <GameProvider>
        <GameStatus />
      </GameProvider>
    );
    
    expect(screen.getByText(/Free choice: You can play in any available grid/i)).toBeInTheDocument();
  });

  test('renders first move information', () => {
    setupGameState({ firstMove: true });
    
    render(
      <GameProvider>
        <GameStatus />
      </GameProvider>
    );
    
    expect(screen.getByText(/First move: You can play anywhere on the board/i)).toBeInTheDocument();
  });

  test('renders win announcement when game is finished', () => {
    setupGameState({ 
      gamePhase: GamePhase.FINISHED,
      gameWinner: Player.O
    });
    
    render(
      <GameProvider>
        <GameStatus />
      </GameProvider>
    );
    
    expect(screen.getByText(/Player O wins the game!/i)).toBeInTheDocument();
    expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
  });

  test('renders setup information when in setup phase', () => {
    setupGameState({ gamePhase: GamePhase.SETUP });
    
    render(
      <GameProvider>
        <GameStatus />
      </GameProvider>
    );
    
    expect(screen.getByText(/Game Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Select game options to begin/i)).toBeInTheDocument();
  });
});