import { Player } from '../../types';
import {
  globalToGridCell,
  gridCellToGlobal,
  getGridCells,
  isSmallGridFull,
  isSmallGridWon,
  isGridPlayable,
  calculateMovementConstraint,
  isValidMove,
  getValidMoves,
  wouldTriggerFullGridException,
  getFullGridExceptionTriggeringCells,
  getPlayableGrids
} from '../gridUtils';

describe('Smart Grid Mapping Logic', () => {
  // Setup test data
  const emptyCells = new Array(81).fill(null);
  const emptyGridWinners = new Array(9).fill(null);
  
  // Create a test board with some filled cells
  const testCells = [...emptyCells];
  // Fill some cells in grid 0
  testCells[0] = Player.X;
  testCells[1] = Player.O;
  testCells[2] = Player.X;
  
  // Fill all cells in grid 4 (center grid)
  for (let i = 36; i < 45; i++) {
    testCells[i] = i % 2 === 0 ? Player.X : Player.O;
  }
  
  // Set up some grid winners
  const testGridWinners = [...emptyGridWinners];
  testGridWinners[2] = Player.X; // Grid 2 is won by X
  
  describe('isSmallGridFull', () => {
    it('should return true for a completely filled grid', () => {
      expect(isSmallGridFull(testCells, 4)).toBe(true);
    });
    
    it('should return false for a partially filled grid', () => {
      expect(isSmallGridFull(testCells, 0)).toBe(false);
    });
    
    it('should return false for an empty grid', () => {
      expect(isSmallGridFull(testCells, 1)).toBe(false);
    });
  });
  
  describe('isSmallGridWon', () => {
    it('should return true for a grid that has been won', () => {
      expect(isSmallGridWon(testGridWinners, 2)).toBe(true);
    });
    
    it('should return false for a grid that has not been won', () => {
      expect(isSmallGridWon(testGridWinners, 0)).toBe(false);
    });
  });
  
  describe('isGridPlayable', () => {
    it('should return false for a grid that is full', () => {
      expect(isGridPlayable(testCells, testGridWinners, 4)).toBe(false);
    });
    
    it('should return false for a grid that has been won', () => {
      expect(isGridPlayable(testCells, testGridWinners, 2)).toBe(false);
    });
    
    it('should return true for a grid that is neither full nor won', () => {
      expect(isGridPlayable(testCells, testGridWinners, 1)).toBe(true);
    });
  });
  
  describe('calculateMovementConstraint', () => {
    it('should return the cell index as the next grid index for normal moves', () => {
      // Move in cell 3 of grid 1 should send to grid 3
      const globalIndex = gridCellToGlobal(1, 3);
      expect(calculateMovementConstraint(globalIndex, emptyCells, emptyGridWinners)).toBe(3);
    });
    
    it('should return null when the target grid is full', () => {
      // Move in cell 4 of grid 1 would normally send to grid 4, but grid 4 is full
      const globalIndex = gridCellToGlobal(1, 4);
      expect(calculateMovementConstraint(globalIndex, testCells, testGridWinners)).toBeNull();
    });
    
    it('should return null when the target grid has been won', () => {
      // Move in cell 2 of grid 1 would normally send to grid 2, but grid 2 is won
      const globalIndex = gridCellToGlobal(1, 2);
      expect(calculateMovementConstraint(globalIndex, testCells, testGridWinners)).toBeNull();
    });
  });
  
  describe('isValidMove', () => {
    it('should allow any move on the first turn', () => {
      expect(isValidMove(0, emptyCells, null, true)).toBe(true);
      expect(isValidMove(80, emptyCells, null, true)).toBe(true);
    });
    
    it('should not allow moves on occupied cells', () => {
      expect(isValidMove(0, testCells, null)).toBe(false);
    });
    
    it('should only allow moves in the constrained grid when constrained', () => {
      // Constrained to grid 3
      expect(isValidMove(gridCellToGlobal(3, 0), emptyCells, 3)).toBe(true);
      expect(isValidMove(gridCellToGlobal(2, 0), emptyCells, 3)).toBe(false);
    });
    
    it('should allow moves in any grid when not constrained', () => {
      expect(isValidMove(gridCellToGlobal(1, 0), emptyCells, null)).toBe(true);
      expect(isValidMove(gridCellToGlobal(5, 0), emptyCells, null)).toBe(true);
    });
  });
  
  describe('getValidMoves', () => {
    it('should return all empty cells on the first move', () => {
      const validMoves = getValidMoves(emptyCells, null, emptyGridWinners, true);
      expect(validMoves.length).toBe(81);
    });
    
    it('should return only cells in the constrained grid when constrained', () => {
      // Constrained to grid 3, which has all 9 cells empty
      const validMoves = getValidMoves(testCells, 3, testGridWinners);
      expect(validMoves.length).toBe(9);
      validMoves.forEach(move => {
        const { gridIndex } = globalToGridCell(move);
        expect(gridIndex).toBe(3);
      });
    });
    
    it('should return all empty cells in non-won grids when not constrained', () => {
      // Not constrained, but grid 2 is won and grid 4 is full
      const validMoves = getValidMoves(testCells, null, testGridWinners);
      validMoves.forEach(move => {
        const { gridIndex } = globalToGridCell(move);
        expect(gridIndex).not.toBe(2); // Grid 2 is won
        expect(gridIndex).not.toBe(4); // Grid 4 is full
      });
    });
  });
  
  describe('wouldTriggerFullGridException', () => {
    it('should return true for moves that would send to a full grid', () => {
      // Move in cell 4 of any grid would send to grid 4, which is full
      const globalIndex = gridCellToGlobal(0, 4);
      expect(wouldTriggerFullGridException(globalIndex, testCells, testGridWinners)).toBe(true);
    });
    
    it('should return true for moves that would send to a won grid', () => {
      // Move in cell 2 of any grid would send to grid 2, which is won
      const globalIndex = gridCellToGlobal(0, 2);
      expect(wouldTriggerFullGridException(globalIndex, testCells, testGridWinners)).toBe(true);
    });
    
    it('should return false for moves that would send to a playable grid', () => {
      // Move in cell 1 of any grid would send to grid 1, which is playable
      const globalIndex = gridCellToGlobal(0, 1);
      expect(wouldTriggerFullGridException(globalIndex, testCells, testGridWinners)).toBe(false);
    });
  });
  
  describe('getFullGridExceptionTriggeringCells', () => {
    it('should return all cells that would send to a full or won grid', () => {
      const triggeringCells = getFullGridExceptionTriggeringCells(testCells, testGridWinners);
      
      // Each cell with index 2 or 4 in any grid would trigger the exception
      // (except those that are already filled)
      triggeringCells.forEach(cellIndex => {
        const { cellIndex: localCellIndex } = globalToGridCell(cellIndex);
        expect([2, 4].includes(localCellIndex)).toBe(true);
      });
    });
  });
  
  describe('getPlayableGrids', () => {
    it('should return all grids that are neither full nor won', () => {
      const playableGrids = getPlayableGrids(testCells, testGridWinners);
      
      // Grids 2 and 4 are not playable
      expect(playableGrids).not.toContain(2);
      expect(playableGrids).not.toContain(4);
      
      // All other grids should be playable
      expect(playableGrids.length).toBe(7);
    });
  });
});