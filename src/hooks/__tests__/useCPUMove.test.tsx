import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useCPUMove } from '../useCPUMove';
import { GameState, Player, PlayerMode, GamePhase, GameMode, CPUDifficulty } from '../../types';
import * as cpuAI from '../../utils/cpuAI';

// Mock the cpuAI module
jest.mock('../../utils/cpuAI', () => ({
  makeCPUMove: jest.fn(),
  validateCPUMove: jest.fn(() => true),
  delay: jest.fn((ms) => Promise.resolve())
}));

describe('useCPUMove Hook', () => {
  // Create a mock game state for testing
  const createMockGameState = (overrides = {}): GameState => ({
    mode: GameMode.BASIC,
    playerMode: PlayerMode.HUMAN_VS_CPU,
    currentPlayer: Player.O, // CPU is player O
    gamePhase: GamePhase.PLAYING,
    firstMove: false,
    constrainedGrid: null,
    cells: new Array(81).fill(null),
    smallGridWinners: new Array(9).fill(null),
    gameWinner: null,
    winningCells: [],
    cpuDifficulty: CPUDifficulty.MEDIUM,
    ...overrides
  });

  // Create a mock makeMove function
  const mockMakeMove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the implementation of makeCPUMove to return a valid move
    (cpuAI.makeCPUMove as jest.Mock).mockResolvedValue(40); // Return center cell
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should trigger CPU move when it is CPU turn', async () => {
    const gameState = createMockGameState();
    
    const { result } = renderHook(() => useCPUMove(gameState, mockMakeMove));
    
    // Initially not thinking
    expect(result.current.isCPUThinking).toBe(false);
    
    // Advance timers to trigger the CPU move
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Should be thinking now
    expect(result.current.isCPUThinking).toBe(true);
    
    // Wait for the CPU move to complete
    await act(async () => {
      await Promise.resolve(); // Wait for the async operation
    });
    
    // Verify makeCPUMove was called with the game state
    expect(cpuAI.makeCPUMove).toHaveBeenCalledWith(gameState);
    
    // Verify makeMove was called with the result from makeCPUMove
    expect(mockMakeMove).toHaveBeenCalledWith(40);
    
    // Should not be thinking anymore
    expect(result.current.isCPUThinking).toBe(false);
  });

  it('should not trigger CPU move when it is human turn', () => {
    const gameState = createMockGameState({
      currentPlayer: Player.X // Human is player X
    });
    
    renderHook(() => useCPUMove(gameState, mockMakeMove));
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify makeCPUMove was not called
    expect(cpuAI.makeCPUMove).not.toHaveBeenCalled();
    expect(mockMakeMove).not.toHaveBeenCalled();
  });

  it('should not trigger CPU move when game is not in playing phase', () => {
    const gameState = createMockGameState({
      gamePhase: GamePhase.SETUP
    });
    
    renderHook(() => useCPUMove(gameState, mockMakeMove));
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify makeCPUMove was not called
    expect(cpuAI.makeCPUMove).not.toHaveBeenCalled();
    expect(mockMakeMove).not.toHaveBeenCalled();
  });

  it('should not trigger CPU move when game has a winner', () => {
    const gameState = createMockGameState({
      gameWinner: Player.X
    });
    
    renderHook(() => useCPUMove(gameState, mockMakeMove));
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify makeCPUMove was not called
    expect(cpuAI.makeCPUMove).not.toHaveBeenCalled();
    expect(mockMakeMove).not.toHaveBeenCalled();
  });

  it('should handle invalid CPU moves with a fallback', async () => {
    const gameState = createMockGameState();
    
    // Mock validateCPUMove to return false (invalid move)
    (cpuAI.validateCPUMove as jest.Mock).mockReturnValueOnce(false);
    
    // Mock makeCPUMove to return different values for first and second calls
    (cpuAI.makeCPUMove as jest.Mock)
      .mockResolvedValueOnce(40) // First call - invalid move
      .mockResolvedValueOnce(10); // Second call - fallback move
    
    const { result } = renderHook(() => useCPUMove(gameState, mockMakeMove));
    
    // Advance timers to trigger the CPU move
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Wait for the CPU move to complete
    await act(async () => {
      await Promise.resolve(); // Wait for the async operation
    });
    
    // Verify makeCPUMove was called twice - once for the original move and once for the fallback
    expect(cpuAI.makeCPUMove).toHaveBeenCalledTimes(2);
    
    // Verify makeMove was called with the fallback move
    expect(mockMakeMove).toHaveBeenCalledWith(10);
  });

  it('should handle errors during CPU move calculation', async () => {
    const gameState = createMockGameState();
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock makeCPUMove to throw an error
    (cpuAI.makeCPUMove as jest.Mock).mockRejectedValueOnce(new Error('CPU move error'));
    
    const { result } = renderHook(() => useCPUMove(gameState, mockMakeMove));
    
    // Advance timers to trigger the CPU move
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Wait for the CPU move to complete
    await act(async () => {
      await Promise.resolve(); // Wait for the async operation
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('CPU move error:', expect.any(Error));
    
    // Verify makeMove was not called
    expect(mockMakeMove).not.toHaveBeenCalled();
    
    // Should not be thinking anymore
    expect(result.current.isCPUThinking).toBe(false);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});