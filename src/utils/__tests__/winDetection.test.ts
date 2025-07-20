import { Player, GameMode } from '../../types';
import {
  checkSmallGridWinner,
  getSmallGridWinningCells,
  checkMasterGridWinner,
  getMasterGridWinningGrids,
  getWinningCombinations,
  checkForWin,
  getMasterGridWinningCells,
  checkGameWinner
} from '../gameUtils';

describe('Win Detection Algorithms', () => {
  // Setup test data
  const emptyCells = new Array(81).fill(null);
  const emptyGridWinners = new Array(9).fill(null);
  
  describe('Small Grid Win Detection', () => {
    it('should detect horizontal wins in a small grid', () => {
      const cells = [...emptyCells];
      // Create a horizontal win for X in the top row of grid 0
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      
      expect(checkSmallGridWinner(cells, 0)).toBe(Player.X);
      expect(getSmallGridWinningCells(cells, 0)).toEqual([0, 1, 2]);
      
      // Check all possible horizontal wins
      const testGrid = (gridIndex: number) => {
        const testCells = [...emptyCells];
        const baseIndex = gridIndex * 9;
        
        // Test each row
        for (let row = 0; row < 3; row++) {
          const rowCells = [...emptyCells];
          const rowStart = baseIndex + row * 3;
          
          // Fill the row with X
          rowCells[rowStart] = Player.X;
          rowCells[rowStart + 1] = Player.X;
          rowCells[rowStart + 2] = Player.X;
          
          expect(checkSmallGridWinner(rowCells, gridIndex)).toBe(Player.X);
          expect(getSmallGridWinningCells(rowCells, gridIndex)).toEqual([
            rowStart, rowStart + 1, rowStart + 2
          ]);
        }
      };
      
      // Test for all grids
      for (let i = 0; i < 9; i++) {
        testGrid(i);
      }
    });
    
    it('should detect vertical wins in a small grid', () => {
      const cells = [...emptyCells];
      // Create a vertical win for O in the left column of grid 1
      const baseIndex = 9; // Grid 1 starts at index 9
      cells[baseIndex] = Player.O;
      cells[baseIndex + 3] = Player.O;
      cells[baseIndex + 6] = Player.O;
      
      expect(checkSmallGridWinner(cells, 1)).toBe(Player.O);
      expect(getSmallGridWinningCells(cells, 1)).toEqual([baseIndex, baseIndex + 3, baseIndex + 6]);
      
      // Check all possible vertical wins
      const testGrid = (gridIndex: number) => {
        const baseIndex = gridIndex * 9;
        
        // Test each column
        for (let col = 0; col < 3; col++) {
          const colCells = [...emptyCells];
          
          // Fill the column with O
          colCells[baseIndex + col] = Player.O;
          colCells[baseIndex + col + 3] = Player.O;
          colCells[baseIndex + col + 6] = Player.O;
          
          expect(checkSmallGridWinner(colCells, gridIndex)).toBe(Player.O);
          expect(getSmallGridWinningCells(colCells, gridIndex)).toEqual([
            baseIndex + col, baseIndex + col + 3, baseIndex + col + 6
          ]);
        }
      };
      
      // Test for all grids
      for (let i = 0; i < 9; i++) {
        testGrid(i);
      }
    });
    
    it('should detect diagonal wins in a small grid', () => {
      // Test main diagonal (top-left to bottom-right)
      const mainDiagCells = [...emptyCells];
      const gridIndex = 4; // Center grid
      const baseIndex = gridIndex * 9;
      
      mainDiagCells[baseIndex] = Player.X;
      mainDiagCells[baseIndex + 4] = Player.X;
      mainDiagCells[baseIndex + 8] = Player.X;
      
      expect(checkSmallGridWinner(mainDiagCells, gridIndex)).toBe(Player.X);
      expect(getSmallGridWinningCells(mainDiagCells, gridIndex)).toEqual([
        baseIndex, baseIndex + 4, baseIndex + 8
      ]);
      
      // Test anti-diagonal (top-right to bottom-left)
      const antiDiagCells = [...emptyCells];
      antiDiagCells[baseIndex + 2] = Player.O;
      antiDiagCells[baseIndex + 4] = Player.O;
      antiDiagCells[baseIndex + 6] = Player.O;
      
      expect(checkSmallGridWinner(antiDiagCells, gridIndex)).toBe(Player.O);
      expect(getSmallGridWinningCells(antiDiagCells, gridIndex)).toEqual([
        baseIndex + 2, baseIndex + 4, baseIndex + 6
      ]);
      
      // Test for all grids
      for (let i = 0; i < 9; i++) {
        const baseIdx = i * 9;
        
        // Main diagonal
        const mainCells = [...emptyCells];
        mainCells[baseIdx] = Player.X;
        mainCells[baseIdx + 4] = Player.X;
        mainCells[baseIdx + 8] = Player.X;
        
        expect(checkSmallGridWinner(mainCells, i)).toBe(Player.X);
        expect(getSmallGridWinningCells(mainCells, i)).toEqual([
          baseIdx, baseIdx + 4, baseIdx + 8
        ]);
        
        // Anti-diagonal
        const antiCells = [...emptyCells];
        antiCells[baseIdx + 2] = Player.O;
        antiCells[baseIdx + 4] = Player.O;
        antiCells[baseIdx + 6] = Player.O;
        
        expect(checkSmallGridWinner(antiCells, i)).toBe(Player.O);
        expect(getSmallGridWinningCells(antiCells, i)).toEqual([
          baseIdx + 2, baseIdx + 4, baseIdx + 6
        ]);
      }
    });
    
    it('should return null when there is no winner', () => {
      // No winner
      expect(checkSmallGridWinner(emptyCells, 0)).toBeNull();
      expect(getSmallGridWinningCells(emptyCells, 0)).toEqual([]);
      
      // Partial fill with no winner
      const partialCells = [...emptyCells];
      partialCells[0] = Player.X;
      partialCells[1] = Player.O;
      partialCells[2] = Player.X;
      
      expect(checkSmallGridWinner(partialCells, 0)).toBeNull();
      expect(getSmallGridWinningCells(partialCells, 0)).toEqual([]);
    });
    
    it('should return all winning combinations for a grid', () => {
      const combinations = getWinningCombinations(0);
      
      // There should be 8 possible winning combinations (3 rows, 3 columns, 2 diagonals)
      expect(combinations.length).toBe(8);
      
      // Check that each combination has 3 indices
      combinations.forEach(combo => {
        expect(combo.length).toBe(3);
      });
      
      // Check that the combinations include all expected patterns
      // For grid 0, the global indices would be 0-8
      
      // Rows
      expect(combinations).toContainEqual([0, 1, 2]);
      expect(combinations).toContainEqual([3, 4, 5]);
      expect(combinations).toContainEqual([6, 7, 8]);
      
      // Columns
      expect(combinations).toContainEqual([0, 3, 6]);
      expect(combinations).toContainEqual([1, 4, 7]);
      expect(combinations).toContainEqual([2, 5, 8]);
      
      // Diagonals
      expect(combinations).toContainEqual([0, 4, 8]);
      expect(combinations).toContainEqual([2, 4, 6]);
    });
    
    it('should detect a win and return winning cells', () => {
      const cells = [...emptyCells];
      // Create a horizontal win for X in the top row of grid 0
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      
      const result = checkForWin(cells, 0);
      expect(result.winner).toBe(Player.X);
      expect(result.winningCells).toEqual([0, 1, 2]);
      
      // No win
      const noWinResult = checkForWin(emptyCells, 0);
      expect(noWinResult.winner).toBeNull();
      expect(noWinResult.winningCells).toEqual([]);
    });
  });
  
  describe('Master Grid Win Detection for Extended Mode', () => {
    it('should detect horizontal wins in the master grid', () => {
      // Create a horizontal win for X in the top row of the master grid
      const smallGridWinners = [...emptyGridWinners];
      smallGridWinners[0] = Player.X;
      smallGridWinners[1] = Player.X;
      smallGridWinners[2] = Player.X;
      
      expect(checkMasterGridWinner(smallGridWinners)).toBe(Player.X);
      expect(getMasterGridWinningGrids(smallGridWinners)).toEqual([0, 1, 2]);
      
      // Test all rows
      for (let row = 0; row < 3; row++) {
        const rowWinners = [...emptyGridWinners];
        const rowStart = row * 3;
        
        rowWinners[rowStart] = Player.O;
        rowWinners[rowStart + 1] = Player.O;
        rowWinners[rowStart + 2] = Player.O;
        
        expect(checkMasterGridWinner(rowWinners)).toBe(Player.O);
        expect(getMasterGridWinningGrids(rowWinners)).toEqual([
          rowStart, rowStart + 1, rowStart + 2
        ]);
      }
    });
    
    it('should detect vertical wins in the master grid', () => {
      // Create a vertical win for O in the left column of the master grid
      const smallGridWinners = [...emptyGridWinners];
      smallGridWinners[0] = Player.O;
      smallGridWinners[3] = Player.O;
      smallGridWinners[6] = Player.O;
      
      expect(checkMasterGridWinner(smallGridWinners)).toBe(Player.O);
      expect(getMasterGridWinningGrids(smallGridWinners)).toEqual([0, 3, 6]);
      
      // Test all columns
      for (let col = 0; col < 3; col++) {
        const colWinners = [...emptyGridWinners];
        
        colWinners[col] = Player.X;
        colWinners[col + 3] = Player.X;
        colWinners[col + 6] = Player.X;
        
        expect(checkMasterGridWinner(colWinners)).toBe(Player.X);
        expect(getMasterGridWinningGrids(colWinners)).toEqual([
          col, col + 3, col + 6
        ]);
      }
    });
    
    it('should detect diagonal wins in the master grid', () => {
      // Test main diagonal (top-left to bottom-right)
      const mainDiagWinners = [...emptyGridWinners];
      mainDiagWinners[0] = Player.X;
      mainDiagWinners[4] = Player.X;
      mainDiagWinners[8] = Player.X;
      
      expect(checkMasterGridWinner(mainDiagWinners)).toBe(Player.X);
      expect(getMasterGridWinningGrids(mainDiagWinners)).toEqual([0, 4, 8]);
      
      // Test anti-diagonal (top-right to bottom-left)
      const antiDiagWinners = [...emptyGridWinners];
      antiDiagWinners[2] = Player.O;
      antiDiagWinners[4] = Player.O;
      antiDiagWinners[6] = Player.O;
      
      expect(checkMasterGridWinner(antiDiagWinners)).toBe(Player.O);
      expect(getMasterGridWinningGrids(antiDiagWinners)).toEqual([2, 4, 6]);
    });
    
    it('should return null when there is no winner in the master grid', () => {
      // No winner
      expect(checkMasterGridWinner(emptyGridWinners)).toBeNull();
      expect(getMasterGridWinningGrids(emptyGridWinners)).toEqual([]);
      
      // Partial wins with no master winner
      const partialWinners = [...emptyGridWinners];
      partialWinners[0] = Player.X;
      partialWinners[1] = Player.O;
      partialWinners[2] = Player.X;
      
      expect(checkMasterGridWinner(partialWinners)).toBeNull();
      expect(getMasterGridWinningGrids(partialWinners)).toEqual([]);
    });
    
    it('should convert winning grid indices to cell indices', () => {
      // Test with a horizontal win in the top row
      const winningGrids = [0, 1, 2];
      
      // Create test cells with wins in grids 0, 1, and 2
      const cells = [...emptyCells];
      
      // Grid 0 win (horizontal top row)
      cells[0] = Player.X;
      cells[1] = Player.X;
      cells[2] = Player.X;
      
      // Grid 1 win (vertical left column)
      cells[9] = Player.X;
      cells[12] = Player.X;
      cells[15] = Player.X;
      
      // Grid 2 win (diagonal)
      cells[18] = Player.X;
      cells[22] = Player.X;
      cells[26] = Player.X;
      
      const smallGridWinners = [
        Player.X, Player.X, Player.X,
        null, null, null,
        null, null, null
      ];
      
      const winningCells = getMasterGridWinningCells(cells, smallGridWinners, winningGrids);
      
      // Should include all winning cells from grids 0, 1, and 2
      expect(winningCells).toContain(0);
      expect(winningCells).toContain(1);
      expect(winningCells).toContain(2);
      expect(winningCells).toContain(9);
      expect(winningCells).toContain(12);
      expect(winningCells).toContain(15);
      expect(winningCells).toContain(18);
      expect(winningCells).toContain(22);
      expect(winningCells).toContain(26);
      
      // Should have 9 cells total (3 from each grid)
      expect(winningCells.length).toBe(9);
    });
    
    it('should check for game winner in both modes', () => {
      // Basic mode - win in a small grid
      const basicCells = [...emptyCells];
      basicCells[0] = Player.X;
      basicCells[1] = Player.X;
      basicCells[2] = Player.X;
      
      const basicResult = checkGameWinner(
        basicCells,
        [null, null, null, null, null, null, null, null, null],
        GameMode.BASIC
      );
      
      expect(basicResult.winner).toBe(Player.X);
      expect(basicResult.winningCells).toEqual([0, 1, 2]);
      
      // Extended mode - win in master grid
      const extendedCells = [...emptyCells];
      // Create wins in grids 0, 1, 2
      
      // Grid 0 win
      extendedCells[0] = Player.X;
      extendedCells[1] = Player.X;
      extendedCells[2] = Player.X;
      
      // Grid 1 win
      extendedCells[9] = Player.X;
      extendedCells[12] = Player.X;
      extendedCells[15] = Player.X;
      
      // Grid 2 win
      extendedCells[18] = Player.X;
      extendedCells[22] = Player.X;
      extendedCells[26] = Player.X;
      
      const extendedResult = checkGameWinner(
        extendedCells,
        [Player.X, Player.X, Player.X, null, null, null, null, null, null],
        GameMode.EXTENDED
      );
      
      expect(extendedResult.winner).toBe(Player.X);
      // Should include all winning cells from the three winning grids
      expect(extendedResult.winningCells.length).toBe(9);
      
      // No winner in extended mode
      const noWinnerResult = checkGameWinner(
        extendedCells,
        [Player.X, Player.O, Player.X, null, null, null, null, null, null],
        GameMode.EXTENDED
      );
      
      expect(noWinnerResult.winner).toBeNull();
      expect(noWinnerResult.winningCells).toEqual([]);
    });
  });
});