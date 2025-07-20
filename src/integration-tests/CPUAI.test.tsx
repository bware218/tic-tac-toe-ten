import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { PlayerMode, CPUDifficulty } from '../types';

// Mock the CPU thinking delay to speed up tests
jest.mock('../hooks/useCPUMove', () => {
  const originalModule = jest.requireActual('../hooks/useCPUMove');
  return {
    ...originalModule,
    // Override the delay to make tests run faster
    CPU_THINKING_DELAY: 100
  };
});

describe('CPU AI Integration', () => {
  beforeEach(() => {
    // Reset any mocks and render the app
    jest.clearAllMocks();
    render(<App />);
  });

  it('should allow selecting CPU opponent mode', async () => {
    // Select CPU opponent mode
    const cpuModeOption = screen.getByRole('radio', { name: /human versus cpu mode/i });
    fireEvent.click(cpuModeOption);

    // Verify CPU difficulty options appear
    await waitFor(() => {
      expect(screen.getByText(/cpu difficulty/i)).toBeInTheDocument();
    });

    // Select hard difficulty
    const hardOption = screen.getByRole('radio', { name: /hard cpu difficulty/i });
    fireEvent.click(hardOption);

    // Start the game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    // Verify game has started
    await waitFor(() => {
      expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
    });
  });

  it('should make CPU moves after human player moves', async () => {
    // Setup CPU game
    const cpuModeOption = screen.getByRole('radio', { name: /human versus cpu mode/i });
    fireEvent.click(cpuModeOption);
    
    // Select easy difficulty for predictable behavior
    const easyOption = screen.getByRole('radio', { name: /easy cpu difficulty/i });
    fireEvent.click(easyOption);
    
    // Start the game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Wait for game to start
    await waitFor(() => {
      expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
    });
    
    // Find a cell and click it (human player X)
    const cells = screen.getAllByRole('button', { name: /cell/i });
    fireEvent.click(cells[0]);
    
    // Wait for CPU thinking indicator
    await waitFor(() => {
      expect(screen.getByText(/CPU is thinking/i)).toBeInTheDocument();
    });
    
    // Wait for CPU to make a move (player O)
    await waitFor(() => {
      // After CPU move, it should be player X's turn again
      expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
    }, { timeout: 1500 });
    
    // Verify that at least one cell has O
    const cellsAfterCPUMove = screen.getAllByRole('button', { name: /cell/i });
    const oMoves = cellsAfterCPUMove.filter(cell => cell.textContent?.includes('O'));
    expect(oMoves.length).toBeGreaterThan(0);
  });

  it('should allow changing CPU difficulty', async () => {
    // Setup CPU game
    const cpuModeOption = screen.getByRole('radio', { name: /human versus cpu mode/i });
    fireEvent.click(cpuModeOption);
    
    // Select easy difficulty initially
    const easyOption = screen.getByRole('radio', { name: /easy cpu difficulty/i });
    fireEvent.click(easyOption);
    
    // Change to medium difficulty
    const mediumOption = screen.getByRole('radio', { name: /medium cpu difficulty/i });
    fireEvent.click(mediumOption);
    
    // Start the game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Verify game started with medium difficulty
    await waitFor(() => {
      expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
    });
    
    // Reset game to check difficulty change
    const resetButton = screen.getByRole('button', { name: /reset game/i });
    fireEvent.click(resetButton);
    
    // Verify we're back to setup
    await waitFor(() => {
      expect(screen.getByText(/select game mode/i)).toBeInTheDocument();
    });
    
    // CPU mode should still be selected
    expect(screen.getByRole('radio', { name: /human versus cpu mode/i })).toBeChecked();
    
    // Medium difficulty should still be selected
    expect(screen.getByRole('radio', { name: /medium cpu difficulty/i })).toBeChecked();
  });
});