import { render, screen, fireEvent } from '@testing-library/react';
import GameModeSelector from '../GameModeSelector';
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

describe('GameModeSelector Component', () => {
  // Helper function to setup the mock game state
  const setupGameState = (customState = {}) => {
    const defaultState = {
      mode: GameMode.BASIC,
      playerMode: PlayerMode.HUMAN_VS_HUMAN,
      currentPlayer: Player.X,
      gamePhase: GamePhase.SETUP,
      firstMove: true,
      constrainedGrid: null,
      cells: new Array(81).fill(null),
      smallGridWinners: new Array(9).fill(null),
      gameWinner: null,
      winningCells: [],
    };

    const mockDispatch = jest.fn();

    (useGame as jest.Mock).mockReturnValue({
      gameState: { ...defaultState, ...customState },
      dispatch: mockDispatch
    });

    return { mockDispatch };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders game mode options', () => {
    setupGameState();
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    expect(screen.getByText(/Game Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic/i)).toBeInTheDocument();
    expect(screen.getByText(/Extended/i)).toBeInTheDocument();
    expect(screen.getByText(/Win by getting three in a row in any small grid/i)).toBeInTheDocument();
    expect(screen.getByText(/Win by winning three small grids in a row on the master grid/i)).toBeInTheDocument();
  });

  test('highlights the currently selected mode', () => {
    setupGameState({ mode: GameMode.EXTENDED });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const basicOption = screen.getByText(/Basic/i).closest('.game-mode-selector__option');
    const extendedOption = screen.getByText(/Extended/i).closest('.game-mode-selector__option');
    
    expect(basicOption).not.toHaveClass('game-mode-selector__option--selected');
    expect(extendedOption).toHaveClass('game-mode-selector__option--selected');
  });

  test('dispatches SET_GAME_MODE action when a mode is selected during setup', () => {
    const { mockDispatch } = setupGameState({ mode: GameMode.BASIC, gamePhase: GamePhase.SETUP });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const extendedOption = screen.getByText(/Extended/i).closest('.game-mode-selector__option');
    fireEvent.click(extendedOption!);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_GAME_MODE',
      payload: GameMode.EXTENDED
    });
  });

  test('dispatches SET_GAME_MODE action when a mode is selected after game is finished', () => {
    const { mockDispatch } = setupGameState({ mode: GameMode.BASIC, gamePhase: GamePhase.FINISHED });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const extendedOption = screen.getByText(/Extended/i).closest('.game-mode-selector__option');
    fireEvent.click(extendedOption!);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_GAME_MODE',
      payload: GameMode.EXTENDED
    });
  });

  test('does not dispatch action when a mode is selected during gameplay', () => {
    const { mockDispatch } = setupGameState({ mode: GameMode.BASIC, gamePhase: GamePhase.PLAYING });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const extendedOption = screen.getByText(/Extended/i).closest('.game-mode-selector__option');
    fireEvent.click(extendedOption!);
    
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('is disabled during gameplay', () => {
    setupGameState({ gamePhase: GamePhase.PLAYING });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const selector = screen.getByText(/Game Mode/i).closest('.game-mode-selector');
    expect(selector).toHaveClass('game-mode-selector__disabled');
  });

  test('handles keyboard navigation with Enter key', () => {
    const { mockDispatch } = setupGameState({ mode: GameMode.BASIC, gamePhase: GamePhase.SETUP });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const extendedOption = screen.getByText(/Extended/i).closest('.game-mode-selector__option');
    fireEvent.keyDown(extendedOption!, { key: 'Enter' });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_GAME_MODE',
      payload: GameMode.EXTENDED
    });
  });

  test('handles keyboard navigation with Space key', () => {
    const { mockDispatch } = setupGameState({ mode: GameMode.BASIC, gamePhase: GamePhase.SETUP });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const extendedOption = screen.getByText(/Extended/i).closest('.game-mode-selector__option');
    fireEvent.keyDown(extendedOption!, { key: ' ' });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_GAME_MODE',
      payload: GameMode.EXTENDED
    });
  });

  test('displays active indicator for selected mode', () => {
    setupGameState({ mode: GameMode.EXTENDED });
    
    render(
      <GameProvider>
        <GameModeSelector />
      </GameProvider>
    );
    
    const activeIndicator = screen.getAllByText('✓');
    expect(activeIndicator).toHaveLength(1);
    expect(activeIndicator[0].closest('.game-mode-selector__option-title')?.textContent).toContain('Extended');
  });
});