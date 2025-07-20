import { Player, CPUDifficulty, GameState, GameMode, PlayerMode, GamePhase } from '../../types';
import { 
  findWinningMove, 
  findBlockingMove, 
  evaluateCellPosition, 
  evaluateGridControl,
  selectMediumDifficultyMove,
  evaluateSmallGrid,
  evaluateBoard,
  makeSimulatedMove,
  minimax,
  selectHardDifficultyMove
} from '../cpuAI';

describe('CPU AI Medium Difficulty', () => {
  // Setup test data
  const emptyCells = new Array(81).fill(null);
  const emptyGridWinners = new Array(9).fill(null);
  
  const createGameState = (
    cells = [...emptyCells],
    constrainedGrid: number | null = null,
    smallGridWinners = [...emptyGridWinners],
    currentPlayer = Player.O
  ): GameState => ({
    mode: GameMode.BASIC,
    playerMode: PlayerMode.HUMAN_VS_CPU,
    cpuDifficulty: CPUDifficulty.MEDIUM,
    currentPlayer,
    gamePhase: GamePhase.PLAYING,
    firstMove: false,
    constrainedGrid,
    cells,
    smallGridWinners,
    gameWinner: null,
    winningCells: []
  });

  describe('findWinningMove', () => {
    it('should find horizontal winning moves', () => {
      const cells = [...emptyCells];
      // Set up a potential win in the top row of grid 0
      cells[0] = Player.X;
      cells[1] = Player.X;
      // cells[2] is empty - winning move
      
      expect(findWinningMove(cells, 0, Player.X)).toBe(2);
    });
    
    it('should find vertical winning moves', () => {
      const cells = [...emptyCells];
      // Set up a potential win in the left column of grid 1
      const baseIndex = 9; // Grid 1 starts at index 9
      cells[baseIndex] = Player.O;
      cells[baseIndex + 6] = Player.O;
      // cells[baseIndex + 3] is empty - winning move
      
      expect(findWinningMove(cells, 1, Player.O)).toBe(baseIndex + 3);
    });
    
    it('should find diagonal winning moves', () => {
      const cells = [...emptyCells];
      // Set up a potential win in the main diagonal of grid 4
      const baseIndex = 36; // Grid 4 starts at index 36
      cells[baseIndex] = Player.X;
      cells[baseIndex + 8] = Player.X;
      // cells[baseIndex + 4] is empty - winning move
      
      expect(findWinningMove(cells, 4, Player.X)).toBe(baseIndex + 4);
    });
    
    it('should return null when no winning move exists', () => {
      const cells = [...emptyCells];
      // Only one X in grid 0, no winning move possible
      cells[0] = Player.X;
      
      expect(findWinningMove(cells, 0, Player.X)).toBeNull();
    });
  });
  
  describe('findBlockingMove', () => {
    it('should find moves to block opponent wins', () => {
      const cells = [...emptyCells];
      // Set up a potential win for X that O needs to block
      cells[0] = Player.X;
      cells[1] = Player.X;
      // cells[2] is empty - blocking move for O
      
      expect(findBlockingMove(cells, 0, Player.O)).toBe(2);
    });
    
    it('should return null when no blocking move is needed', () => {
      const cells = [...emptyCells];
      // Only one X in grid 0, no immediate threat
      cells[0] = Player.X;
      
      expect(findBlockingMove(cells, 0, Player.O)).toBeNull();
    });
  });
  
  describe('evaluateCellPosition', () => {
    it('should rate center cells highest', () => {
      expect(evaluateCellPosition(4)).toBe(3); // Center
    });
    
    it('should rate corner cells second highest', () => {
      expect(evaluateCellPosition(0)).toBe(2); // Top-left corner
      expect(evaluateCellPosition(2)).toBe(2); // Top-right corner
      expect(evaluateCellPosition(6)).toBe(2); // Bottom-left corner
      expect(evaluateCellPosition(8)).toBe(2); // Bottom-right corner
    });
    
    it('should rate edge cells lowest', () => {
      expect(evaluateCellPosition(1)).toBe(1); // Top edge
      expect(evaluateCellPosition(3)).toBe(1); // Left edge
      expect(evaluateCellPosition(5)).toBe(1); // Right edge
      expect(evaluateCellPosition(7)).toBe(1); // Bottom edge
    });
  });
  
  describe('selectMediumDifficultyMove', () => {
    it('should prioritize winning moves', () => {
      const cells = [...emptyCells];
      // Set up a potential win in grid 0
      cells[0] = Player.O;
      cells[1] = Player.O;
      
      const gameState = createGameState(cells, 0);
      const validMoves = [2, 3, 4, 5, 6, 7, 8]; // All empty cells in grid 0
      
      expect(selectMediumDifficultyMove(validMoves, gameState)).toBe(2);
    });
    
    it('should prioritize blocking moves when no winning moves exist', () => {
      const cells = [...emptyCells];
      // Set up a potential win for X that O needs to block
      cells[0] = Player.X;
      cells[1] = Player.X;
      
      const gameState = createGameState(cells, 0);
      const validMoves = [2, 3, 4, 5, 6, 7, 8]; // All empty cells in grid 0
      
      expect(selectMediumDifficultyMove(validMoves, gameState)).toBe(2);
    });
    
    it('should choose strategic positions when no winning or blocking moves exist', () => {
      const cells = [...emptyCells];
      // No winning or blocking moves needed
      cells[0] = Player.X;
      cells[8] = Player.O;
      
      const gameState = createGameState(cells, 0);
      const validMoves = [1, 2, 3, 4, 5, 6, 7]; // All other empty cells in grid 0
      
      // Should prefer center (index 4) over other positions
      expect(selectMediumDifficultyMove(validMoves, gameState)).toBe(4);
    });
    
    it('should handle free choice scenarios by checking all grids', () => {
      const cells = [...emptyCells];
      // Set up a potential win in grid 2
      cells[18] = Player.O;
      cells[19] = Player.O;
      
      // Set up a potential block in grid 1
      cells[9] = Player.X;
      cells[10] = Player.X;
      
      const gameState = createGameState(cells, null); // Free choice
      const validMoves = [
        // Some valid moves across different grids
        11, 12, 20, 21, 22, 27, 36
      ];
      
      // Should prioritize winning (grid 2) over blocking (grid 1)
      expect(selectMediumDifficultyMove(validMoves, gameState)).toBe(20);
    });
  });
});

describe('CPU AI Hard Difficulty', () => {
  // Setup test data
  const emptyCells = new Array(81).fill(null);
  const emptyGridWinners = new Array(9).fill(null);
  
  const createGameState = (
    cells = [...emptyCells],
    constrainedGrid: number | null = null,
    smallGridWinners = [...emptyGridWinners],
    currentPlayer = Player.O,
    mode = GameMode.BASIC,
    cpuDifficulty = CPUDifficulty.HARD
  ): GameState => ({
    mode,
    playerMode: PlayerMode.HUMAN_VS_CPU,
    cpuDifficulty,
    currentPlayer,
    gamePhase: GamePhase.PLAYING,
    firstMove: false,
    constrainedGrid,
    cells,
    smallGridWinners,
    gameWinner: null,
    winningCells: []
  });

  describe('evaluateSmallGrid', () => {
    it('should return high score for winning grid', () => {
      const cells = [...emptyCells];
      // Set up a win for O in grid 0
      cells[0] = Player.O;
      cells[1] = Player.O;
      cells[2] = Player.O;
      
      expect(evaluateSmallGrid(cells, 0, Player.O)).toBe(10);
    });
    
    it('should return negative score for opponent winning grid', () => {
      const cells = [...emptyCells];
      // Set up a win for X in grid 0
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      
      expect(evaluateSmallGrid(cells, 0, Player.O)).toBe(-10);
    });
    
    it('should give bonus for center control', () => {
      const cells = [...emptyCells];
      // O controls center
      cells[4] = Player.O;
      
      // Score should be positive and include center bonus
      expect(evaluateSmallGrid(cells, 0, Player.O)).toBeGreaterThan(0);
    });
  });
  
  describe('makeSimulatedMove', () => {
    it('should update cells and switch player', () => {
      const cells = [...emptyCells];
      const gameState = createGameState(cells, 0);
      
      const newState = makeSimulatedMove(gameState, 0);
      
      // Cell should be updated
      expect(newState.cells[0]).toBe(Player.O);
      
      // Player should be switched
      expect(newState.currentPlayer).toBe(Player.X);
      
      // Constrained grid should be updated based on move
      expect(newState.constrainedGrid).toBe(0);
    });
    
    it('should update small grid winners when a move wins a grid', () => {
      const cells = [...emptyCells];
      // Set up a potential win for O in grid 0
      cells[0] = Player.O;
      cells[1] = Player.O;
      
      const gameState = createGameState(cells, 0);
      
      // Make the winning move
      const newState = makeSimulatedMove(gameState, 2);
      
      // Grid 0 should be won by O
      expect(newState.smallGridWinners[0]).toBe(Player.O);
    });
    
    it('should set constrainedGrid to null when target grid is full or won', () => {
      const cells = [...emptyCells];
      const smallGridWinners = [...emptyGridWinners];
      
      // Grid 4 is already won
      smallGridWinners[4] = Player.X;
      
      const gameState = createGameState(cells, 0, smallGridWinners);
      
      // Make a move that would send to grid 4
      const newState = makeSimulatedMove(gameState, 4);
      
      // Should be free choice since grid 4 is won
      expect(newState.constrainedGrid).toBeNull();
    });
  });
  
  describe('selectHardDifficultyMove', () => {
    it('should choose winning move when available', () => {
      const cells = [...emptyCells];
      // Set up a potential win for O in grid 0
      cells[0] = Player.O;
      cells[1] = Player.O;
      
      const gameState = createGameState(cells, 0);
      const validMoves = [2, 3, 4, 5, 6, 7, 8]; // All empty cells in grid 0
      
      expect(selectHardDifficultyMove(validMoves, gameState)).toBe(2);
    });
    
    it('should block opponent win when no immediate win is available', () => {
      const cells = [...emptyCells];
      // Set up a potential win for X in grid 0
      cells[0] = Player.X;
      cells[1] = Player.X;
      
      const gameState = createGameState(cells, 0);
      const validMoves = [2, 3, 4, 5, 6, 7, 8]; // All empty cells in grid 0
      
      expect(selectHardDifficultyMove(validMoves, gameState)).toBe(2);
    });
    
    it('should make strategic moves based on position evaluation', () => {
      const cells = [...emptyCells];
      // No immediate wins or blocks
      cells[0] = Player.X;
      
      const gameState = createGameState(cells, 0);
      const validMoves = [1, 2, 3, 4, 5, 6, 7, 8]; // All other empty cells in grid 0
      
      // We're not testing the exact move, but that it makes a valid strategic move
      const selectedMove = selectHardDifficultyMove(validMoves, gameState);
      expect(validMoves).toContain(selectedMove);
      
      // Verify that the center position is evaluated higher than other positions
      const centerScore = evaluateCellPosition(4);
      const cornerScore = evaluateCellPosition(0);
      const edgeScore = evaluateCellPosition(1);
      
      expect(centerScore).toBeGreaterThan(cornerScore);
      expect(cornerScore).toBeGreaterThan(edgeScore);
    });
    
    it('should make strategic moves in extended mode', () => {
      const cells = [...emptyCells];
      const smallGridWinners = [...emptyGridWinners];
      
      // O has won grid 0 and 4
      smallGridWinners[0] = Player.O;
      smallGridWinners[4] = Player.O;
      
      // X has won grid 1
      smallGridWinners[1] = Player.X;
      
      const gameState = createGameState(cells, null, smallGridWinners, Player.O, GameMode.EXTENDED);
      
      // Valid moves in grid 8 (which would complete a diagonal win for O)
      const validMoves = [72, 73, 74, 75, 76, 77, 78, 79, 80];
      
      // Should choose a move in grid 8 to try to win it
      const selectedMove = selectHardDifficultyMove(validMoves, gameState);
      expect(validMoves).toContain(selectedMove);
    });
  });
});