import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { GameMode, PlayerMode } from '../types';

// Integration tests for game flow
describe('Game Flow Integration', () => {
  beforeEach(() => {
    // Reset any mocks and render the app
    jest.clearAllMocks();
    render(<App />);
  });

  test('should start a new game', async () => {
    // Wait for the game to load
    await waitFor(() => {
      expect(screen.getByText(/Select game options/i)).toBeInTheDocument();
    });

    // Start the game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    // Verify game has started
    await waitFor(() => {
      expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
    });
  });

  test('should switch game modes correctly', async () => {
    // Select extended mode
    const extendedModeOption = screen.getByRole('radio', { name: /extended game mode/i });
    fireEvent.click(extendedModeOption);

    // Start the game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    // Verify game has started in extended mode
    await waitFor(() => {
      expect(screen.getByText(/Player X's turn/i)).toBeInTheDocument();
    });
  });
});