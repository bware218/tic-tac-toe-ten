import { render, screen, fireEvent } from '@testing-library/react';
import PlayerModeSelector from '../PlayerModeSelector';
import { GameProvider } from '../../../context/GameContext';
import { GameMode, GamePhase, Player, PlayerMode, CPUDifficulty } from '../../../types';

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

describe('PlayerModeSelector Component', () => {
  // Helper function to setup the mock game state
  const setupGameState = (customState = {}) => {
    const defaultState = {
      mode: GameMode.BASIC,
      playerMode: PlayerMode.HUMAN_VS_HUMAN,
      cpuDifficulty: CPUDifficulty.MEDIUM,
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

  test('renders player mode options', () => {
    setupGameState();
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    expect(screen.getByText(/Player Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Human vs Human/i)).toBeInTheDocument();
    expect(screen.getByText(/Human vs CPU/i)).toBeInTheDocument();
    expect(screen.getByText(/Play against another human player/i)).toBeInTheDocument();
    expect(screen.getByText(/Play against the computer/i)).toBeInTheDocument();
  });

  test('highlights the currently selected player mode', () => {
    setupGameState({ playerMode: PlayerMode.HUMAN_VS_CPU });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const humanOption = screen.getByText(/Human vs Human/i).closest('.player-mode-selector__option');
    const cpuOption = screen.getByText(/Human vs CPU/i).closest('.player-mode-selector__option');
    
    expect(humanOption).not.toHaveClass('player-mode-selector__option--selected');
    expect(cpuOption).toHaveClass('player-mode-selector__option--selected');
  });

  test('dispatches SET_PLAYER_MODE action when a mode is selected during setup', () => {
    const { mockDispatch } = setupGameState({ playerMode: PlayerMode.HUMAN_VS_HUMAN, gamePhase: GamePhase.SETUP });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const cpuOption = screen.getByText(/Human vs CPU/i).closest('.player-mode-selector__option');
    fireEvent.click(cpuOption!);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_PLAYER_MODE',
      payload: PlayerMode.HUMAN_VS_CPU
    });
  });

  test('does not dispatch action when a mode is selected during gameplay', () => {
    const { mockDispatch } = setupGameState({ playerMode: PlayerMode.HUMAN_VS_HUMAN, gamePhase: GamePhase.PLAYING });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const cpuOption = screen.getByText(/Human vs CPU/i).closest('.player-mode-selector__option');
    fireEvent.click(cpuOption!);
    
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('is disabled during gameplay', () => {
    setupGameState({ gamePhase: GamePhase.PLAYING });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const selector = screen.getByText(/Player Mode/i).closest('.player-mode-selector');
    expect(selector).toHaveClass('player-mode-selector__disabled');
  });

  test('shows CPU difficulty options when Human vs CPU is selected', () => {
    setupGameState({ playerMode: PlayerMode.HUMAN_VS_CPU });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    expect(screen.getByText(/CPU Difficulty/i)).toBeInTheDocument();
    expect(screen.getByText(/Easy/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium/i)).toBeInTheDocument();
    expect(screen.getByText(/Hard/i)).toBeInTheDocument();
  });

  test('does not show CPU difficulty options when Human vs Human is selected', () => {
    setupGameState({ playerMode: PlayerMode.HUMAN_VS_HUMAN });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    expect(screen.queryByText(/CPU Difficulty/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Easy/i)).not.toBeInTheDocument();
  });

  test('highlights the currently selected CPU difficulty', () => {
    setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_CPU,
      cpuDifficulty: CPUDifficulty.HARD 
    });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const easyOption = screen.getByText(/Easy/i).closest('.player-mode-selector__difficulty-option');
    const mediumOption = screen.getByText(/Medium/i).closest('.player-mode-selector__difficulty-option');
    const hardOption = screen.getByText(/Hard/i).closest('.player-mode-selector__difficulty-option');
    
    expect(easyOption).not.toHaveClass('player-mode-selector__difficulty-option--selected');
    expect(mediumOption).not.toHaveClass('player-mode-selector__difficulty-option--selected');
    expect(hardOption).toHaveClass('player-mode-selector__difficulty-option--selected');
  });

  test('dispatches SET_CPU_DIFFICULTY action when a difficulty is selected', () => {
    const { mockDispatch } = setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_CPU,
      cpuDifficulty: CPUDifficulty.MEDIUM,
      gamePhase: GamePhase.SETUP
    });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const hardOption = screen.getByText(/Hard/i).closest('.player-mode-selector__difficulty-option');
    fireEvent.click(hardOption!);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CPU_DIFFICULTY',
      payload: CPUDifficulty.HARD
    });
  });

  test('shows appropriate description for each CPU difficulty level', () => {
    setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_CPU,
      cpuDifficulty: CPUDifficulty.EASY
    });
    
    const { rerender } = render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    expect(screen.getByText(/Random moves - good for beginners/i)).toBeInTheDocument();
    
    // Change to medium difficulty
    setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_CPU,
      cpuDifficulty: CPUDifficulty.MEDIUM
    });
    
    rerender(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    expect(screen.getByText(/Strategic moves - will try to win and block your wins/i)).toBeInTheDocument();
    
    // Change to hard difficulty
    setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_CPU,
      cpuDifficulty: CPUDifficulty.HARD
    });
    
    rerender(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    expect(screen.getByText(/Advanced strategy - plans multiple moves ahead/i)).toBeInTheDocument();
  });

  test('handles keyboard navigation with Enter key', () => {
    const { mockDispatch } = setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_HUMAN,
      gamePhase: GamePhase.SETUP
    });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const cpuOption = screen.getByText(/Human vs CPU/i).closest('.player-mode-selector__option');
    fireEvent.keyDown(cpuOption!, { key: 'Enter' });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_PLAYER_MODE',
      payload: PlayerMode.HUMAN_VS_CPU
    });
  });

  test('handles keyboard navigation with Space key', () => {
    const { mockDispatch } = setupGameState({ 
      playerMode: PlayerMode.HUMAN_VS_CPU,
      cpuDifficulty: CPUDifficulty.EASY,
      gamePhase: GamePhase.SETUP
    });
    
    render(
      <GameProvider>
        <PlayerModeSelector />
      </GameProvider>
    );
    
    const mediumOption = screen.getByText(/Medium/i).closest('.player-mode-selector__difficulty-option');
    fireEvent.keyDown(mediumOption!, { key: ' ' });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CPU_DIFFICULTY',
      payload: CPUDifficulty.MEDIUM
    });
  });
});