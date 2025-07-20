import { GameState, GameAction, Player, GameMode, PlayerMode, GamePhase, CPUDifficulty } from '../types';
import { calculateMovementConstraint, isValidMove } from '../utils/gridUtils';
import { checkWinningState } from '../utils/winDetectionIntegration';
import { determineGamePhase, isGameDraw } from '../utils/gameFlowManager';

// Create initial game state
export const createInitialGameState = (): GameState => ({
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
  cpuDifficulty: CPUDifficulty.MEDIUM
});

// Reset game state while preserving settings
export const resetGameState = (currentState: GameState): GameState => ({
  ...currentState,
  currentPlayer: Player.X,
  gamePhase: GamePhase.PLAYING,
  firstMove: true,
  constrainedGrid: null,
  cells: new Array(81).fill(null),
  smallGridWinners: new Array(9).fill(null),
  gameWinner: null,
  winningCells: []
});

// Helper function to get the next player
const getNextPlayer = (currentPlayer: Player): Player => {
  return currentPlayer === Player.X ? Player.O : Player.X;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { cellIndex, player } = action.payload;
      
      // Validate move using Smart Grid mapping logic
      if (state.gamePhase !== GamePhase.PLAYING || 
          !isValidMove(cellIndex, state.cells, state.constrainedGrid, state.firstMove)) {
        return state;
      }
      
      // Make the move
      const newCells = [...state.cells];
      newCells[cellIndex] = player;
      
      // Calculate next movement constraint using Smart Grid mapping
      const nextConstrainedGrid = calculateMovementConstraint(cellIndex, newCells, state.smallGridWinners);
      
      // Check for wins after the move
      const winningState = checkWinningState({
        ...state,
        cells: newCells
      });
      
      // Create updated state
      const updatedState = {
        ...state,
        cells: newCells,
        currentPlayer: getNextPlayer(player),
        firstMove: false,
        constrainedGrid: nextConstrainedGrid,
        smallGridWinners: winningState.smallGridWinners,
        gameWinner: winningState.gameWinner,
        winningCells: winningState.winningCells
      };
      
      // Determine if game phase should change
      updatedState.gamePhase = determineGamePhase(updatedState);
      
      return updatedState;
    }
    
    case 'SET_GAME_MODE': {
      return {
        ...state,
        mode: action.payload
      };
    }
    
    case 'SET_PLAYER_MODE': {
      return {
        ...state,
        playerMode: action.payload
      };
    }
    
    case 'SET_CPU_DIFFICULTY': {
      return {
        ...state,
        cpuDifficulty: action.payload
      };
    }
    
    case 'UPDATE_WINNING_STATE': {
      const { smallGridWinners, gameWinner, winningCells } = action.payload;
      
      // Create updated state
      const updatedState = {
        ...state,
        smallGridWinners,
        gameWinner,
        winningCells
      };
      
      // Determine if game phase should change
      updatedState.gamePhase = determineGamePhase(updatedState);
      
      return updatedState;
    }
    
    case 'START_GAME': {
      return {
        ...state,
        gamePhase: GamePhase.PLAYING
      };
    }
    
    case 'RESET_GAME': {
      return resetGameState(state);
    }
    
    case 'NEW_GAME': {
      return createInitialGameState();
    }
    
    default:
      return state;
  }
};