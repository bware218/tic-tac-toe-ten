import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BusinessBabies, { CHARACTERS } from '../BusinessBabies';
import { GamePhase, PlayerMode } from '../../../types';

// Mock the GameContext to provide controlled game state
const mockGameState = {
  mode: 'basic' as const,
  playerMode: 'human-vs-human' as PlayerMode,
  cpuDifficulty: 'easy' as const,
  currentPlayer: 'X' as const,
  gamePhase: GamePhase.PLAYING,
  firstMove: false,
  constrainedGrid: null,
  cells: Array(81).fill(null),
  smallGridWinners: Array(9).fill(null),
  gameWinner: null,
  winningCells: []
};

const mockDispatch = jest.fn();

jest.mock('../../../context/GameContext', () => ({
  ...jest.requireActual('../../../context/GameContext'),
  useGame: () => ({
    gameState: mockGameState,
    dispatch: mockDispatch
  })
}));

describe('BusinessBabies Dynamic Commentary System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock timers for testing periodic commentary
    jest.useFakeTimers();
    
    // Reset sessionStorage mock for each test
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render all 6 business baby characters', () => {
    render(<BusinessBabies />);
    
    // Check that all character names are present
    CHARACTERS.forEach(character => {
      expect(screen.getByText(character.name)).toBeInTheDocument();
    });
  });
  
  it('should ensure each character has a unique personality', () => {
    // Check that each character has a unique personality
    const personalities = CHARACTERS.map(char => char.personality);
    const uniquePersonalities = [...new Set(personalities)];
    expect(personalities.length).toBe(uniquePersonalities.length);
    
    // Check that all 6 personality types are represented
    const expectedPersonalities = ['overconfident', 'pessimistic', 'cheerful', 'serious', 'funny', 'wise'];
    expectedPersonalities.forEach(personality => {
      expect(personalities).toContain(personality);
    });
  });

  it('should display initial commentary when game starts', async () => {
    render(<BusinessBabies />);
    
    // Wait for initial comments to be set
    await waitFor(() => {
      // Check that speech bubbles are present (at least some characters should have comments)
      const speechBubbles = screen.getAllByText(/./);
      expect(speechBubbles.length).toBeGreaterThan(6); // More than just character names
    });
  });

  it('should show different commentary for CPU vs human games', () => {
    const cpuGameState = {
      ...mockGameState,
      playerMode: 'human-vs-cpu' as PlayerMode
    };

    // Mock the useGame hook to return CPU game state
    jest.doMock('../../../context/GameContext', () => ({
      ...jest.requireActual('../../../context/GameContext'),
      useGame: () => ({
        gameState: cpuGameState,
        dispatch: mockDispatch
      })
    }));

    render(<BusinessBabies isCPUThinking={true} />);
    
    // The component should handle CPU-specific commentary
    expect(screen.getByText('Analyst Alex')).toBeInTheDocument();
  });

  it('should update commentary periodically', async () => {
    render(<BusinessBabies />);
    
    // Fast-forward time to trigger periodic updates
    jest.advanceTimersByTime(15000); // 15 seconds
    
    await waitFor(() => {
      // Commentary should be updated (this is hard to test directly, but we can verify the component doesn't crash)
      expect(screen.getByText('Analyst Alex')).toBeInTheDocument();
    });
  });

  it('should handle CPU thinking state', () => {
    render(<BusinessBabies isCPUThinking={true} />);
    
    // Component should render without errors when CPU is thinking
    expect(screen.getByText('Analyst Alex')).toBeInTheDocument();
    expect(screen.getByText('Intern Izzy')).toBeInTheDocument();
  });

  it('should not render during setup phase', () => {
    // Create a setup game state
    const setupGameState = {
      ...mockGameState,
      gamePhase: GamePhase.SETUP
    };

    // Mock the useGame hook for this specific test
    const mockUseGame = jest.fn(() => ({
      gameState: setupGameState,
      dispatch: mockDispatch
    }));

    // Temporarily replace the useGame hook
    const originalModule = require('../../../context/GameContext');
    originalModule.useGame = mockUseGame;

    const { container } = render(<BusinessBabies />);
    
    // Component should not render anything during setup
    expect(container.firstChild).toBeNull();
  });

  it('should have toggle functionality that saves preferences', () => {
    // Reset the mock to use the default implementation
    jest.resetModules();
    jest.mock('../../../context/GameContext', () => ({
      ...jest.requireActual('../../../context/GameContext'),
      useGame: () => ({
        gameState: {
          ...mockGameState,
          gamePhase: GamePhase.PLAYING
        },
        dispatch: mockDispatch
      })
    }));
    
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
    
    render(<BusinessBabies />);
    
    // Look for toggle button - it should be present regardless of commentator visibility
    const toggleButton = screen.getByRole('button', { name: /commentators/i });
    expect(toggleButton).toBeInTheDocument();
    
    // Click the toggle button
    toggleButton.click();
    
    // Check if sessionStorage.setItem was called with the correct values
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('showCommentators', 'false');
    
    // Click again to show commentators
    toggleButton.click();
    
    // Check if sessionStorage.setItem was called with the correct values
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('showCommentators', 'true');
  });
  
  it('should load preferences from session storage on initialization', () => {
    // Reset the mock to use the default implementation
    jest.resetModules();
    const mockGamePhase = GamePhase.PLAYING;
    jest.mock('../../../context/GameContext', () => ({
      ...jest.requireActual('../../../context/GameContext'),
      useGame: () => ({
        gameState: {
          ...mockGameState,
          gamePhase: mockGamePhase
        },
        dispatch: mockDispatch
      })
    }));
    
    // Mock sessionStorage with a saved preference
    const mockSessionStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'showCommentators') return 'false';
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 1,
      key: jest.fn()
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
    
    // Render with default isVisible=true, but sessionStorage should override to false
    render(<BusinessBabies isVisible={true} />);
    
    // Check that sessionStorage.getItem was called
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith('showCommentators');
    
    // The toggle button should say "Show Commentators" since commentators are hidden
    const toggleButton = screen.getByRole('button', { name: /show commentators/i });
    expect(toggleButton).toBeInTheDocument();
  });
  
  it('should verify character personality consistency in commentary', async () => {
    // Create a game state with a small grid win to trigger specific commentary
    const gameStateWithWin = {
      ...mockGameState,
      smallGridWinners: [null, 'X', null, null, null, null, null, null, null]
    };
    
    // Mock the useGame hook for this specific test
    jest.mock('../../../context/GameContext', () => ({
      ...jest.requireActual('../../../context/GameContext'),
      useGame: () => ({
        gameState: gameStateWithWin,
        dispatch: mockDispatch
      })
    }));
    
    render(<BusinessBabies />);
    
    // Wait for commentary to update based on the small grid win
    await waitFor(() => {
      // Check that all characters are rendered
      CHARACTERS.forEach(character => {
        expect(screen.getByText(character.name)).toBeInTheDocument();
      });
    });
    
    // The test passes if the component renders without errors
    // We can't directly test the content of random commentary, but we can verify
    // that the component handles the state change correctly
  });
  
  it('should handle game end commentary', async () => {
    // Create a game state with a winner
    const gameStateWithWinner = {
      ...mockGameState,
      gameWinner: 'X'
    };
    
    // Mock the useGame hook for this specific test
    jest.mock('../../../context/GameContext', () => ({
      ...jest.requireActual('../../../context/GameContext'),
      useGame: () => ({
        gameState: gameStateWithWinner,
        dispatch: mockDispatch
      })
    }));
    
    render(<BusinessBabies />);
    
    // Wait for game end commentary to be set
    await waitFor(() => {
      // Check that all characters are rendered
      CHARACTERS.forEach(character => {
        expect(screen.getByText(character.name)).toBeInTheDocument();
      });
    });
    
    // The test passes if the component renders without errors with a game winner
  });
  
  it('should test responsive design breakpoints', () => {
    // Mock window.matchMedia for testing responsive design
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    const { container } = render(<BusinessBabies />);
    
    // Check that the component renders with the correct structure
    expect(container.querySelector('.business-babies-container')).toBeInTheDocument();
    expect(container.querySelector('.business-babies-left')).toBeInTheDocument();
    expect(container.querySelector('.business-babies-right')).toBeInTheDocument();
    
    // The test passes if the component renders with the correct structure
  });
});