import { 
  isCPUTurn, 
  shouldBlockPlayerInput, 
  isCellPlayable, 
  getGameStateMessage,
  isGameDraw,
  determineGamePhase
} from '../gameFlowManager';
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

describe('Game Flow Manager', () => {
  describe('isCPUTurn', () => {
    it('should return true when it is CPU turn', () => {
      const gameState = createTestGameState({
        playerMode: PlayerMode.HUMAN_VS_CPU,
        currentPlayer: Player.O,
        gamePhase: GamePhase.PLAYING
      });
      
      expect(isCPUTurn(gameState)).toBe(true);
    });
    
    it('should return false when it is human turn in CPU mode', () => {
      const gameState = createTestGameState({
        playerMode: PlayerMode.HUMAN_VS_CPU,
        currentPlayer: Player.X,
        gamePhase: GamePhase.PLAYING
      });
      
      expect(isCPUTurn(gameState)).toBe(false);
    });
    
    it('should return false in human vs human mode', () => {
      const gameState = createTestGameState({
        playerMode: PlayerMode.HUMAN_VS_HUMAN,
        currentPlayer: Player.O,
        gamePhase: GamePhase.PLAYING
      });
      
      expect(isCPUTurn(gameState)).toBe(false);
    });
    
    it('should return false when game is not in playing phase', () => {
      const gameState = createTestGameState({
        playerMode: PlayerMode.HUMAN_VS_CPU,
        currentPlayer: Player.O,
        gamePhase: GamePhase.FINISHED
      });
      
      expect(isCPUTurn(gameState)).toBe(false);
    });
  });
  
  describe('shouldBlockPlayerInput', () => {
    it('should block input when CPU is thinking', () => {
      const gameState = createTestGameState();
      expect(shouldBlockPlayerInput(gameState, true)).toBe(true);
    });
    
    it('should block input when game is not in playing phase', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.SETUP
      });
      
      expect(shouldBlockPlayerInput(gameState, false)).toBe(true);
    });
    
    it('should block input during CPU turn', () => {
      const gameState = createTestGameState({
        playerMode: PlayerMode.HUMAN_VS_CPU,
        currentPlayer: Player.O
      });
      
      expect(shouldBlockPlayerInput(gameState, false)).toBe(true);
    });
    
    it('should not block input during human turn', () => {
      const gameState = createTestGameState({
        playerMode: PlayerMode.HUMAN_VS_HUMAN,
        gamePhase: GamePhase.PLAYING
      });
      
      expect(shouldBlockPlayerInput(gameState, false)).toBe(false);
    });
  });
  
  describe('isCellPlayable', () => {
    it('should return false if cell is already filled', () => {
      const cells = new Array(81).fill(null);
      cells[42] = Player.X;
      
      const gameState = createTestGameState({
        cells
      });
      
      expect(isCellPlayable(gameState, 42)).toBe(false);
    });
    
    it('should return false if game is not in playing phase', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.FINISHED
      });
      
      expect(isCellPlayable(gameState, 42)).toBe(false);
    });
    
    it('should return true for any empty cell on first move', () => {
      const gameState = createTestGameState({
        firstMove: true
      });
      
      expect(isCellPlayable(gameState, 42)).toBe(true);
    });
    
    it('should return true for any empty cell when no constraint', () => {
      const gameState = createTestGameState({
        constrainedGrid: null
      });
      
      expect(isCellPlayable(gameState, 42)).toBe(true);
    });
    
    it('should return true for cell in constrained grid', () => {
      const gameState = createTestGameState({
        constrainedGrid: 4
      });
      
      // Cell 42 is in grid 4 (4 * 9 + 6 = 42)
      expect(isCellPlayable(gameState, 42)).toBe(true);
    });
    
    it('should return false for cell outside constrained grid', () => {
      const gameState = createTestGameState({
        constrainedGrid: 4
      });
      
      // Cell 10 is in grid 1, not grid 4
      expect(isCellPlayable(gameState, 10)).toBe(false);
    });
  });
  
  describe('getGameStateMessage', () => {
    it('should return setup message during setup phase', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.SETUP
      });
      
      expect(getGameStateMessage(gameState)).toContain('Select game options');
    });
    
    it('should return win message when game is finished with winner', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.FINISHED,
        gameWinner: Player.X
      });
      
      expect(getGameStateMessage(gameState)).toContain('Player X wins');
    });
    
    it('should return draw message when game is finished without winner', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.FINISHED,
        gameWinner: null
      });
      
      expect(getGameStateMessage(gameState)).toContain('draw');
    });
    
    it('should indicate free choice on first move', () => {
      const gameState = createTestGameState({
        firstMove: true,
        currentPlayer: Player.X
      });
      
      const message = getGameStateMessage(gameState);
      expect(message).toContain('Player X');
      expect(message).toContain('anywhere');
    });
    
    it('should indicate free choice when no constraint', () => {
      const gameState = createTestGameState({
        constrainedGrid: null,
        currentPlayer: Player.O
      });
      
      const message = getGameStateMessage(gameState);
      expect(message).toContain('Player O');
      expect(message).toContain('any available grid');
    });
    
    it('should indicate constrained grid', () => {
      const gameState = createTestGameState({
        constrainedGrid: 4,
        currentPlayer: Player.X
      });
      
      const message = getGameStateMessage(gameState);
      expect(message).toContain('Player X');
      expect(message).toContain('grid 5'); // 4 + 1 for display
    });
  });
  
  describe('isGameDraw', () => {
    it('should return true when all cells are filled and no winner', () => {
      const gameState = createTestGameState({
        cells: new Array(81).fill(Player.X),
        gameWinner: null
      });
      
      expect(isGameDraw(gameState)).toBe(true);
    });
    
    it('should return false when there is a winner', () => {
      const gameState = createTestGameState({
        cells: new Array(81).fill(Player.X),
        gameWinner: Player.X
      });
      
      expect(isGameDraw(gameState)).toBe(false);
    });
    
    it('should return false when not all cells are filled', () => {
      const cells = new Array(81).fill(Player.X);
      cells[42] = null;
      
      const gameState = createTestGameState({
        cells,
        gameWinner: null
      });
      
      expect(isGameDraw(gameState)).toBe(false);
    });
  });
  
  describe('determineGamePhase', () => {
    it('should return FINISHED when there is a winner', () => {
      const gameState = createTestGameState({
        gameWinner: Player.X,
        gamePhase: GamePhase.PLAYING
      });
      
      expect(determineGamePhase(gameState)).toBe(GamePhase.FINISHED);
    });
    
    it('should return FINISHED when game is a draw', () => {
      const gameState = createTestGameState({
        cells: new Array(81).fill(Player.X),
        gameWinner: null,
        gamePhase: GamePhase.PLAYING
      });
      
      expect(determineGamePhase(gameState)).toBe(GamePhase.FINISHED);
    });
    
    it('should maintain current phase otherwise', () => {
      const gameState = createTestGameState({
        gamePhase: GamePhase.PLAYING
      });
      
      expect(determineGamePhase(gameState)).toBe(GamePhase.PLAYING);
    });
  });
});