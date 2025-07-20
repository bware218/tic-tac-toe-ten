import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameControls from '../GameControls';
import { GameProvider } from '../../../context/GameContext';
import { GamePhase } from '../../../types';
import * as GameContext from '../../../context/GameContext';

// Mock the useGame hook
jest.mock('../../../context/GameContext', () => ({
  ...jest.requireActual('../../../context/GameContext'),
  useGame: jest.fn(),
}));

describe('GameControls', () => {
  // Mock dispatch function
  const mockDispatch = jest.fn();
  
  // Helper function to setup the component with different game phases
  const setupComponent = (gamePhase: GamePhase) => {
    (GameContext.useGame as jest.Mock).mockReturnValue({
      gameState: {
        gamePhase,
        mode: 'basic',
      },
      dispatch: mockDispatch,
    });
    
    return render(
      <GameProvider>
        <GameControls />
      </GameProvider>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders Start Game button in setup phase', () => {
    setupComponent(GamePhase.SETUP);
    
    const startButton = screen.getByText('Start Game');
    expect(startButton).toBeInTheDocument();
    
    fireEvent.click(startButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_GAME' });
  });
  
  test('renders Reset Game button in playing phase', () => {
    setupComponent(GamePhase.PLAYING);
    
    const resetButton = screen.getByText('Reset Game');
    expect(resetButton).toBeInTheDocument();
    
    fireEvent.click(resetButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_GAME' });
  });
  
  test('renders Play Again and New Game buttons in finished phase', () => {
    setupComponent(GamePhase.FINISHED);
    
    const playAgainButton = screen.getByText('Play Again');
    const newGameButton = screen.getByText('New Game');
    
    expect(playAgainButton).toBeInTheDocument();
    expect(newGameButton).toBeInTheDocument();
    
    fireEvent.click(playAgainButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_GAME' });
    
    fireEvent.click(newGameButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'NEW_GAME' });
  });
  
  test('renders New Game text button during gameplay', () => {
    setupComponent(GamePhase.PLAYING);
    
    const newGameButton = screen.getByText('New Game');
    expect(newGameButton).toBeInTheDocument();
    
    fireEvent.click(newGameButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'NEW_GAME' });
  });
  
  test('handles keyboard navigation', () => {
    setupComponent(GamePhase.SETUP);
    
    const startButton = screen.getByText('Start Game');
    
    // Simulate pressing Enter key
    fireEvent.keyDown(startButton, { key: 'Enter' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_GAME' });
    
    mockDispatch.mockClear();
    
    // Simulate pressing Space key
    fireEvent.keyDown(startButton, { key: ' ' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_GAME' });
  });
});