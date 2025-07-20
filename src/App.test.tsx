import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the components used in App
jest.mock('./components/MasterGrid/MasterGrid', () => {
  return function MockMasterGrid({ onCellClick }: { onCellClick: (index: number) => void }) {
    return (
      <div data-testid="master-grid-mock">
        Master Grid Component
        <button data-testid="cell-click-test" onClick={() => onCellClick(42)}>
          Click Cell
        </button>
      </div>
    );
  };
});

jest.mock('./components/GameStatus/GameStatus', () => {
  return function MockGameStatus() {
    return <div data-testid="game-status-mock">Game Status Component</div>;
  };
});

// Mock GameControls with a button that triggers START_GAME action
jest.mock('./components/GameControls/GameControls', () => {
  return function MockGameControls() {
    // Access the useGame context to dispatch actions
    const { dispatch } = require('./context/GameContext').useGame();
    
    return (
      <div data-testid="game-controls-mock">
        Game Controls Component
        <button 
          data-testid="start-game-button"
          onClick={() => dispatch({ type: 'START_GAME' })}
        >
          Start Game
        </button>
        <button 
          data-testid="reset-game-button"
          onClick={() => dispatch({ type: 'RESET_GAME' })}
        >
          Reset Game
        </button>
      </div>
    );
  };
});

jest.mock('./components/GameModeSelector/GameModeSelector', () => {
  return function MockGameModeSelector() {
    return <div data-testid="game-mode-selector-mock">Game Mode Selector Component</div>;
  };
});

jest.mock('./components/PlayerModeSelector/PlayerModeSelector', () => {
  return function MockPlayerModeSelector() {
    return <div data-testid="player-mode-selector-mock">Player Mode Selector Component</div>;
  };
});

jest.mock('./components/CPUThinking/CPUThinking', () => {
  return function MockCPUThinking() {
    return <div data-testid="cpu-thinking-mock">CPU Thinking Component</div>;
  };
});

// Mock CPU move hook
const mockIsCPUThinking = jest.fn().mockReturnValue(false);
jest.mock('./hooks/useCPUMove', () => ({
  useCPUMove: () => ({ isCPUThinking: mockIsCPUThinking() })
}));

// Mock game flow manager functions
jest.mock('./utils/gameFlowManager', () => {
  // Import the actual types
  const actualTypes = jest.requireActual('./types');
  
  return {
    shouldBlockPlayerInput: jest.fn().mockImplementation((gameState, isCPUThinking) => {
      // Block input if CPU is thinking or game is not in playing phase
      return isCPUThinking || gameState.gamePhase !== actualTypes.GamePhase.PLAYING;
    }),
    isCellPlayable: jest.fn().mockImplementation((gameState, cellIndex) => {
      // Cell is playable if it's empty and game is in playing phase
      return gameState.cells[cellIndex] === null && gameState.gamePhase === actualTypes.GamePhase.PLAYING;
    }),
    getGameStateMessage: jest.fn().mockReturnValue('Test game state message'),
    isGameDraw: jest.fn().mockReturnValue(false),
    determineGamePhase: jest.fn().mockImplementation((gameState) => gameState.gamePhase),
    isCPUTurn: jest.fn().mockImplementation((gameState) => {
      return gameState.playerMode === actualTypes.PlayerMode.HUMAN_VS_CPU && 
             gameState.currentPlayer === 'O' && 
             gameState.gamePhase === actualTypes.GamePhase.PLAYING;
    })
  };
});

// Mock win detection integration
jest.mock('./utils/winDetectionIntegration', () => {
  return {
    checkWinningState: jest.fn().mockImplementation((gameState) => {
      return {
        smallGridWinners: gameState.smallGridWinners || [],
        gameWinner: null,
        winningCells: []
      };
    })
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the header with title', () => {
    render(<App />);
    expect(screen.getByText('Tic Tac Toe Ten')).toBeInTheDocument();
    expect(screen.getByText('A strategic game on the Smart Grid platform')).toBeInTheDocument();
  });

  test('renders the setup screen initially', () => {
    render(<App />);
    expect(screen.getByTestId('game-mode-selector-mock')).toBeInTheDocument();
    expect(screen.getByTestId('player-mode-selector-mock')).toBeInTheDocument();
    expect(screen.getByTestId('game-controls-mock')).toBeInTheDocument();
  });

  test('transitions from setup to playing phase', async () => {
    render(<App />);
    
    // Initially in setup phase
    expect(screen.getByTestId('game-mode-selector-mock')).toBeInTheDocument();
    
    // Click start game button
    fireEvent.click(screen.getByTestId('start-game-button'));
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('master-grid-mock')).toBeInTheDocument();
    });
  });

  test.skip('handles cell clicks in playing phase', async () => {
    render(<App />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-game-button'));
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('master-grid-mock')).toBeInTheDocument();
    });
    
    // Click a cell
    fireEvent.click(screen.getByTestId('cell-click-test'));
    
    // No error message should appear since the mock isCellPlayable returns true
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test.skip('shows error message for invalid moves', async () => {
    // Override the isCellPlayable mock to return false
    require('./utils/gameFlowManager').isCellPlayable.mockReturnValueOnce(false);
    
    render(<App />);
    
    // Start the game
    fireEvent.click(screen.getByTestId('start-game-button'));
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('master-grid-mock')).toBeInTheDocument();
    });
    
    // Click a cell
    fireEvent.click(screen.getByTestId('cell-click-test'));
    
    // Error message should appear
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('renders the footer', () => {
    render(<App />);
    expect(screen.getByText('Tic Tac Toe Ten - A strategic Smart Grid game')).toBeInTheDocument();
  });
});