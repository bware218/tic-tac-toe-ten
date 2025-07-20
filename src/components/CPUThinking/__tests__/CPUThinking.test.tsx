import React from 'react';
import { render, screen } from '@testing-library/react';
import CPUThinking from '../CPUThinking';
import { useGame } from '../../../context/GameContext';
import { CPUDifficulty } from '../../../types';

// Mock the useGame hook
jest.mock('../../../context/GameContext', () => ({
  useGame: jest.fn()
}));

describe('CPUThinking Component', () => {
  // Setup mock for useGame
  const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;
  
  beforeEach(() => {
    // Default mock implementation
    mockUseGame.mockReturnValue({
      gameState: {
        cpuDifficulty: CPUDifficulty.MEDIUM
      },
      dispatch: jest.fn()
    } as any);
  });

  it('should render when isThinking is true', () => {
    render(<CPUThinking isThinking={true} />);
    // Check for any thinking message (exact text varies based on random selection)
    expect(screen.getByText(/CPU is/)).toBeInTheDocument();
  });

  it('should not render when isThinking is false', () => {
    render(<CPUThinking isThinking={false} />);
    expect(screen.queryByText(/CPU is/)).not.toBeInTheDocument();
  });

  it('should apply different CSS classes based on difficulty', () => {
    // Test for easy difficulty
    mockUseGame.mockReturnValue({
      gameState: {
        cpuDifficulty: CPUDifficulty.EASY
      },
      dispatch: jest.fn()
    } as any);
    
    const { container, rerender } = render(<CPUThinking isThinking={true} />);
    expect(container.querySelector('.cpu-difficulty-easy')).toBeInTheDocument();
    
    // Test for medium difficulty
    mockUseGame.mockReturnValue({
      gameState: {
        cpuDifficulty: CPUDifficulty.MEDIUM
      },
      dispatch: jest.fn()
    } as any);
    
    rerender(<CPUThinking isThinking={true} />);
    expect(container.querySelector('.cpu-difficulty-medium')).toBeInTheDocument();
    
    // Test for hard difficulty
    mockUseGame.mockReturnValue({
      gameState: {
        cpuDifficulty: CPUDifficulty.HARD
      },
      dispatch: jest.fn()
    } as any);
    
    rerender(<CPUThinking isThinking={true} />);
    expect(container.querySelector('.cpu-difficulty-hard')).toBeInTheDocument();
  });
});