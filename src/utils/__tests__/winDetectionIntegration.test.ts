import { Player, GameMode } from '../../types';
import { checkWinningState } from '../winDetectionIntegration';

describe('Win Detection Integration', () => {
  // Setup test data
  const emptyCells = new Array(81).fill(null);
  const emptyGridWinners = new Array(9).fill(null);
  
  describe('checkWinningState', () => {
    it('should detect small grid wins in basic mode', () => {
      // Create a horizontal win for X in the top row of grid 0
      const cells = [...emptyCells];
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      
      const result = checkWinningState({
        mode: GameMode.BASIC,
        cells,
        smallGridWinners: [...emptyGridWinners]
      } as any);
      
      // Should update smallGridWinners
      expect(result.smallGridWinners[0]).toBe(Player.X);
      
      // Should set gameWinner in basic mode
      expect(result.gameWinner).toBe(Player.X);
      
      // Should include winning cells
      expect(result.winningCells).toEqual([0, 1, 2]);
    });
    
    it('should detect master grid wins in extended mode', () => {
      // Create a scenario where X wins three small grids in a row
      const cells = [...emptyCells];
      const smallGridWinners = [...emptyGridWinners];
      
      // Win grid 0 with a horizontal win
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      smallGridWinners[0] = Player.X;
      
      // Win grid 1 with a vertical win
      cells[9] = Player.X;
      cells[12] = Player.X;
      cells[15] = Player.X;
      smallGridWinners[1] = Player.X;
      
      // Win grid 2 with a diagonal win
      cells[18] = Player.X;
      cells[22] = Player.X;
      cells[26] = Player.X;
      smallGridWinners[2] = Player.X;
      
      const result = checkWinningState({
        mode: GameMode.EXTENDED,
        cells,
        smallGridWinners
      } as any);
      
      // Should set gameWinner in extended mode
      expect(result.gameWinner).toBe(Player.X);
      
      // Should include all winning cells from the three grids
      expect(result.winningCells.length).toBe(9);
      expect(result.winningCells).toContain(0);
      expect(result.winningCells).toContain(1);
      expect(result.winningCells).toContain(2);
      expect(result.winningCells).toContain(9);
      expect(result.winningCells).toContain(12);
      expect(result.winningCells).toContain(15);
      expect(result.winningCells).toContain(18);
      expect(result.winningCells).toContain(22);
      expect(result.winningCells).toContain(26);
    });
    
    it('should not declare a winner in extended mode for small grid wins', () => {
      // Create a horizontal win for X in the top row of grid 0
      const cells = [...emptyCells];
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      
      const result = checkWinningState({
        mode: GameMode.EXTENDED,
        cells,
        smallGridWinners: [...emptyGridWinners]
      } as any);
      
      // Should update smallGridWinners
      expect(result.smallGridWinners[0]).toBe(Player.X);
      
      // Should NOT set gameWinner in extended mode for a single small grid win
      expect(result.gameWinner).toBeNull();
      
      // Should NOT include winning cells for the game
      expect(result.winningCells).toEqual([]);
    });
    
    it('should handle multiple small grid wins in the same move', () => {
      // Create a scenario where a single move completes two small grids
      const cells = [...emptyCells];
      
      // Set up grid 0 with two X's in a row
      cells[0] = Player.X;
      cells[1] = Player.X;
      
      // Set up grid 2 with two X's in a row
      cells[18] = Player.X;
      cells[19] = Player.X;
      
      // The move at cell 2 would complete grid 0
      // The move at cell 20 would complete grid 2
      // But we can't make both moves at once, so this is just a theoretical test
      
      const testCells = [...cells];
      testCells[2] = Player.X; // Complete grid 0
      
      const result = checkWinningState({
        mode: GameMode.BASIC,
        cells: testCells,
        smallGridWinners: [...emptyGridWinners]
      } as any);
      
      // Should update smallGridWinners for grid 0
      expect(result.smallGridWinners[0]).toBe(Player.X);
      
      // Should set gameWinner in basic mode
      expect(result.gameWinner).toBe(Player.X);
    });
    
    it('should handle no wins', () => {
      // Create a scenario with no wins
      const cells = [...emptyCells];
      
      // Add some moves that don't create wins
      cells[0] = Player.X;
      cells[1] = Player.O;
      cells[2] = Player.X;
      cells[9] = Player.O;
      cells[18] = Player.X;
      
      const result = checkWinningState({
        mode: GameMode.BASIC,
        cells,
        smallGridWinners: [...emptyGridWinners]
      } as any);
      
      // Should not update any smallGridWinners
      expect(result.smallGridWinners.every(winner => winner === null)).toBe(true);
      
      // Should not set gameWinner
      expect(result.gameWinner).toBeNull();
      
      // Should not include any winning cells
      expect(result.winningCells).toEqual([]);
    });
    
    it('should handle a full game with multiple small grid wins', () => {
      // Create a complex scenario with multiple small grid wins
      const cells = [...emptyCells];
      const smallGridWinners = [...emptyGridWinners];
      
      // X wins grid 0
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      smallGridWinners[0] = Player.X;
      
      // O wins grid 1
      cells[9] = Player.O;
      cells[10] = Player.O;
      cells[11] = Player.O;
      smallGridWinners[1] = Player.O;
      
      // X wins grid 2
      cells[18] = Player.X;
      cells[19] = Player.X;
      cells[20] = Player.X;
      smallGridWinners[2] = Player.X;
      
      // O wins grid 3
      cells[27] = Player.O;
      cells[28] = Player.O;
      cells[29] = Player.O;
      smallGridWinners[3] = Player.O;
      
      // X wins grid 4
      cells[36] = Player.X;
      cells[37] = Player.X;
      cells[38] = Player.X;
      smallGridWinners[4] = Player.X;
      
      // O wins grid 5
      cells[45] = Player.O;
      cells[46] = Player.O;
      cells[47] = Player.O;
      smallGridWinners[5] = Player.O;
      
      // X wins grid 6 (completing a diagonal win on the master grid)
      cells[54] = Player.X;
      cells[55] = Player.X;
      cells[56] = Player.X;
      
      const result = checkWinningState({
        mode: GameMode.EXTENDED,
        cells,
        smallGridWinners
      } as any);
      
      // Should update smallGridWinners for grid 6
      expect(result.smallGridWinners[6]).toBe(Player.X);
      
      // Should set gameWinner in extended mode (X wins with diagonal 0-4-8)
      expect(result.gameWinner).toBe(Player.X);
      
      // Should include winning cells from grids 0, 4, and 6
      expect(result.winningCells).toContain(0);
      expect(result.winningCells).toContain(1);
      expect(result.winningCells).toContain(2);
      expect(result.winningCells).toContain(36);
      expect(result.winningCells).toContain(37);
      expect(result.winningCells).toContain(38);
      expect(result.winningCells).toContain(54);
      expect(result.winningCells).toContain(55);
      expect(result.winningCells).toContain(56);
    });
  });
});