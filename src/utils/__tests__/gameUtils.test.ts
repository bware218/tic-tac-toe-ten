import { 
  validateMove, 
  validateGameState, 
  handleGameError, 
  canGameContinue,
  getErrorMessage
} from '../gameUtils';
import { 
  GameState, 
  GamePhase, 
  Player, 
  PlayerMode, 
  GameMode,
  CPUDifficulty 
} from '../../types';

// Helper to create a test game state
const createTestGameState = (overrides: Partial<GameState> = {}): GameState => ({
  mode: GameMode.BASIC,
  playerMode: PlayerMode.HUMAN_VS_HUMAN,
  currentPlayer: Player.X,
  gamePhase: GamePhase.PLAYING,
  firstMove: false,
  constrainedGrid: 4,
  cells: new Array(81).fill(null),
  smallGridWinners: new Array(9).fill(null),
  gameWinner: null,
  winningCells: [],
  cpuDifficulty: CPUDifficulty.MEDIUM,
  ...overrides
});

describe('Game Utilities', () => {
  describe('validateMove', () => {
    it('should return null for valid move', () => {
      const gameState = createTestGameState();
      // Cell 42 is in grid 4 (4 * 9 + 6 = 42)
      expect(validateMove(gameState, 42)).toBeNull();
    });
    
    it('should return error for occupied cell', () => {
      const cells = new Array(81).fill(null);
      cells[42] = Player.X;
      
      const gameState = createTestGameState({ cells });
      expect(validateMove(gameState, 42)).toContain('occupied');
    });
    
    it('should return error for wrong grid', () => {
      const gameState = createTestGameState();
      // Cell 10 is in grid 1, not grid 4
      expect(validateMove(gameState, 10)).toContain('grid 5'); // 4 + 1 for display
    });
    
    it('should allow any empty cell on first move', () => {
      const gameState = createTestGameState({ firstMove: true });
      expect(validateMove(gameState, 10)).toBeNull();
    });
    
    it('should allow any empty cell when no constraint', () => {
      const gameState = createTestGameState({ constrainedGrid: null });
      expect(validateMove(gameState, 10)).toBeNull();
    });
    
    it('should return error when game is not in playing phase', () => {
      const gameState = createTestGameState({ gamePhase: GamePhase.FINISHED });
      expect(validateMove(gameState, 42)).toContain('not in progress');
    });
    
    it('should return error for invalid cell index', () => {
      const gameState = createTestGameState();
      expect(validateMove(gameState, 100)).toContain('Invalid cell index');
    });
  });
  
  describe('validateGameState', () => {
    it('should return empty array for valid state', () => {
      const gameState = createTestGameState();
      expect(validateGameState(gameState)).toEqual([]);
    });
    
    it('should detect invalid cells array length', () => {
      const gameState = createTestGameState({ cells: new Array(80).fill(null) });
      const errors = validateGameState(gameState);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('cells array');
    });
    
    it('should detect invalid smallGridWinners array length', () => {
      const gameState = createTestGameState({ smallGridWinners: new Array(8).fill(null) });
      const errors = validateGameState(gameState);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('smallGridWinners');
    });
    
    it('should detect invalid constrainedGrid value', () => {
      const gameState = createTestGameState({ constrainedGrid: 10 });
      const errors = validateGameState(gameState);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('constrainedGrid');
    });
    
    it('should detect invalid currentPlayer value', () => {
      const gameState = createTestGameState({ currentPlayer: 'Z' as Player });
      const errors = validateGameState(gameState);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('currentPlayer');
    });
  });
  
  describe('handleGameError', () => {
    it('should handle string errors', () => {
      const message = handleGameError('Test error');
      expect(message).toContain('error');
    });
    
    it('should handle Error objects', () => {
      const message = handleGameError(new Error('Test error'));
      expect(message).toContain('error');
    });
    
    it('should provide specific message for cells array error', () => {
      const message = handleGameError('Invalid cells array length');
      expect(message).toContain('reset');
    });
    
    it('should provide specific message for constrainedGrid error', () => {
      const message = handleGameError('Invalid constrainedGrid value');
      expect(message).toContain('grid constraint');
    });
  });
  
  describe('canGameContinue', () => {
    it('should return true for valid playing state', () => {
      const gameState = createTestGameState();
      expect(canGameContinue(gameState)).toBe(true);
    });
    
    it('should return false when game is not in playing phase', () => {
      const gameState = createTestGameState({ gamePhase: GamePhase.FINISHED });
      expect(canGameContinue(gameState)).toBe(false);
    });
    
    it('should return false when game has a winner', () => {
      const gameState = createTestGameState({ gameWinner: Player.X });
      expect(canGameContinue(gameState)).toBe(false);
    });
    
    it('should return false when all cells are filled', () => {
      const gameState = createTestGameState({ cells: new Array(81).fill(Player.X) });
      expect(canGameContinue(gameState)).toBe(false);
    });
  });
  
  describe('getErrorMessage', () => {
    it('should return specific message for known error code', () => {
      expect(getErrorMessage('cell-occupied')).toContain('occupied');
      expect(getErrorMessage('wrong-grid')).toContain('highlighted grid');
      expect(getErrorMessage('game-over')).toContain('ended');
    });
    
    it('should return generic message for unknown error code', () => {
      expect(getErrorMessage('unknown-error')).toContain('error occurred');
    });
  });
});