// Grid indexing and calculation utilities for Tic Tac Toe Ten
import { CellValue, Player, GridPosition } from '../types';

/**
 * Converts a global cell index (0-80) to grid and cell indices
 * @param globalIndex - Index from 0-80 representing position in the entire 9x9 grid
 * @returns Object with gridIndex (0-8) and cellIndex (0-8)
 */
export function globalToGridCell(globalIndex: number): { gridIndex: number; cellIndex: number } {
  if (globalIndex < 0 || globalIndex > 80) {
    throw new Error(`Invalid global index: ${globalIndex}. Must be between 0 and 80.`);
  }
  
  const gridIndex = Math.floor(globalIndex / 9);
  const cellIndex = globalIndex % 9;
  
  return { gridIndex, cellIndex };
}

/**
 * Converts grid and cell indices to a global index
 * @param gridIndex - Index of the small grid (0-8)
 * @param cellIndex - Index within the small grid (0-8)
 * @returns Global index (0-80)
 */
export function gridCellToGlobal(gridIndex: number, cellIndex: number): number {
  if (gridIndex < 0 || gridIndex > 8) {
    throw new Error(`Invalid grid index: ${gridIndex}. Must be between 0 and 8.`);
  }
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  
  return gridIndex * 9 + cellIndex;
}

/**
 * Gets all global indices for cells in a specific small grid
 * @param gridIndex - Index of the small grid (0-8)
 * @returns Array of 9 global indices for that grid
 */
export function getGridCells(gridIndex: number): number[] {
  if (gridIndex < 0 || gridIndex > 8) {
    throw new Error(`Invalid grid index: ${gridIndex}. Must be between 0 and 8.`);
  }
  
  const startIndex = gridIndex * 9;
  return Array.from({ length: 9 }, (_, i) => startIndex + i);
}

/**
 * Converts a global index to row and column in the overall 9x9 grid
 * @param globalIndex - Index from 0-80
 * @returns Object with row (0-8) and col (0-8)
 */
export function globalToRowCol(globalIndex: number): GridPosition {
  if (globalIndex < 0 || globalIndex > 80) {
    throw new Error(`Invalid global index: ${globalIndex}. Must be between 0 and 80.`);
  }
  
  const { gridIndex, cellIndex } = globalToGridCell(globalIndex);
  
  // Grid position in the 3x3 arrangement of small grids
  const gridRow = Math.floor(gridIndex / 3);
  const gridCol = gridIndex % 3;
  
  // Cell position within the small grid
  const cellRow = Math.floor(cellIndex / 3);
  const cellCol = cellIndex % 3;
  
  // Overall position in the 9x9 grid
  const row = gridRow * 3 + cellRow;
  const col = gridCol * 3 + cellCol;
  
  return { row, col };
}

/**
 * Converts row and column in the overall 9x9 grid to a global index
 * @param row - Row in the 9x9 grid (0-8)
 * @param col - Column in the 9x9 grid (0-8)
 * @returns Global index (0-80)
 */
export function rowColToGlobal(row: number, col: number): number {
  if (row < 0 || row > 8) {
    throw new Error(`Invalid row: ${row}. Must be between 0 and 8.`);
  }
  if (col < 0 || col > 8) {
    throw new Error(`Invalid column: ${col}. Must be between 0 and 8.`);
  }
  
  // Calculate grid position
  const gridRow = Math.floor(row / 3);
  const gridCol = Math.floor(col / 3);
  const gridIndex = gridRow * 3 + gridCol;
  
  // Calculate cell position within grid
  const cellRow = row % 3;
  const cellCol = col % 3;
  const cellIndex = cellRow * 3 + cellCol;
  
  return gridCellToGlobal(gridIndex, cellIndex);
}

/**
 * Converts a cell index (0-8) to its display number (1-9)
 * @param cellIndex - Index within a small grid (0-8)
 * @returns Display number (1-9)
 */
export function cellIndexToDisplayNumber(cellIndex: number): number {
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  return cellIndex + 1;
}

/**
 * Converts a display number (1-9) to cell index (0-8)
 * @param displayNumber - Display number (1-9)
 * @returns Cell index (0-8)
 */
export function displayNumberToCellIndex(displayNumber: number): number {
  if (displayNumber < 1 || displayNumber > 9) {
    throw new Error(`Invalid display number: ${displayNumber}. Must be between 1 and 9.`);
  }
  return displayNumber - 1;
}

// Smart Grid Mapping Logic

/**
 * Determines which small grid the next player must play in based on the current move
 * This is the core Smart Grid mapping rule: move in cell N sends opponent to grid N
 * @param cellIndex - The cell index within the small grid (0-8) where the current move was made
 * @returns The grid index (0-8) where the next player must play
 */
export function getNextConstrainedGrid(cellIndex: number): number {
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  return cellIndex;
}

/**
 * Checks if a small grid is completely filled (no empty cells)
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to check (0-8)
 * @returns True if the grid is full, false otherwise
 */
export function isSmallGridFull(cells: (string | null)[] | CellValue[], gridIndex: number): boolean {
  if (gridIndex < 0 || gridIndex > 8) {
    throw new Error(`Invalid grid index: ${gridIndex}. Must be between 0 and 8.`);
  }
  
  const gridCells = getGridCells(gridIndex);
  return gridCells.every(globalIndex => cells[globalIndex] !== null);
}

/**
 * Checks if a small grid has been won by a player
 * @param smallGridWinners - Array of winners for each small grid
 * @param gridIndex - Index of the small grid to check (0-8)
 * @returns True if the grid has been won, false otherwise
 */
export function isSmallGridWon(smallGridWinners: (Player | null)[] | (string | null)[], gridIndex: number): boolean {
  if (gridIndex < 0 || gridIndex > 8) {
    throw new Error(`Invalid grid index: ${gridIndex}. Must be between 0 and 8.`);
  }
  
  return smallGridWinners[gridIndex] !== null;
}

/**
 * Checks if a grid is playable (not completely full)
 * Note: Won grids are still playable - only completely full grids trigger free choice
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of winners for each small grid
 * @param gridIndex - Index of the small grid to check (0-8)
 * @returns True if the grid is playable, false otherwise
 */
export function isGridPlayable(
  cells: CellValue[],
  smallGridWinners: (Player | null)[],
  gridIndex: number
): boolean {
  // A grid is playable as long as it's not completely full
  // Won grids can still be played in - only full grids trigger free choice
  return !isSmallGridFull(cells, gridIndex);
}

/**
 * Determines the movement constraint for the next player after a move is made
 * Implements the Smart Grid mapping system with full grid exception handling
 * @param globalCellIndex - The global cell index (0-80) where the move was made
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of winners for each small grid
 * @returns Grid index (0-8) if constrained, null if free choice allowed
 */
export function calculateMovementConstraint(
  globalCellIndex: number,
  cells: CellValue[],
  smallGridWinners: (Player | null)[]
): number | null {
  if (globalCellIndex < 0 || globalCellIndex > 80) {
    throw new Error(`Invalid global cell index: ${globalCellIndex}. Must be between 0 and 80.`);
  }
  
  // Get the cell position within its small grid
  const { cellIndex } = globalToGridCell(globalCellIndex);
  
  // The Smart Grid rule: move in cell N sends opponent to grid N
  const targetGridIndex = getNextConstrainedGrid(cellIndex);
  
  // Check if the target grid allows moves (not won and not full)
  if (!isGridPlayable(cells, smallGridWinners, targetGridIndex)) {
    // Full grid exception: player can move anywhere
    return null;
  }
  
  return targetGridIndex;
}

/**
 * Validates if a move is allowed based on current game constraints
 * @param globalCellIndex - The global cell index (0-80) where the player wants to move
 * @param cells - Array of all 81 cell values
 * @param constrainedGrid - Current grid constraint (null if free choice)
 * @param isFirstMove - Whether this is the first move of the game
 * @returns True if the move is valid, false otherwise
 */
export function isValidMove(
  globalCellIndex: number,
  cells: CellValue[],
  constrainedGrid: number | null,
  isFirstMove: boolean = false
): boolean {
  if (globalCellIndex < 0 || globalCellIndex > 80) {
    return false;
  }
  
  // Check if cell is already occupied
  if (cells[globalCellIndex] !== null) {
    return false;
  }
  
  // First move can be anywhere
  if (isFirstMove) {
    return true;
  }
  
  // If no constraint (free choice), any empty cell is valid
  if (constrainedGrid === null) {
    return true;
  }
  
  // Check if the move is in the constrained grid
  const { gridIndex } = globalToGridCell(globalCellIndex);
  return gridIndex === constrainedGrid;
}

/**
 * Gets all valid move positions for the current player
 * @param cells - Array of all 81 cell values
 * @param constrainedGrid - Current grid constraint (null if free choice)
 * @param smallGridWinners - Array of winners for each small grid
 * @param isFirstMove - Whether this is the first move of the game
 * @returns Array of valid global cell indices
 */
export function getValidMoves(
  cells: CellValue[],
  constrainedGrid: number | null,
  smallGridWinners: (Player | null)[],
  isFirstMove: boolean = false
): number[] {
  const validMoves: number[] = [];
  
  if (isFirstMove) {
    // First move: any empty cell
    for (let i = 0; i < 81; i++) {
      if (cells[i] === null) {
        validMoves.push(i);
      }
    }
    return validMoves;
  }
  
  if (constrainedGrid === null) {
    // Free choice: any empty cell (including in won grids)
    for (let i = 0; i < 81; i++) {
      if (cells[i] === null) {
        validMoves.push(i);
      }
    }
    return validMoves;
  }
  
  // Constrained to specific grid: only empty cells in that grid
  const gridCells = getGridCells(constrainedGrid);
  for (const globalIndex of gridCells) {
    if (cells[globalIndex] === null) {
      validMoves.push(globalIndex);
    }
  }
  
  return validMoves;
}

/**
 * Determines if a move would send the opponent to a full or won grid
 * @param globalCellIndex - The global cell index (0-80) where the player wants to move
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of winners for each small grid
 * @returns True if the move would trigger the full grid exception, false otherwise
 */
export function wouldTriggerFullGridException(
  globalCellIndex: number,
  cells: CellValue[],
  smallGridWinners: (Player | null)[]
): boolean {
  if (globalCellIndex < 0 || globalCellIndex > 80) {
    throw new Error(`Invalid global cell index: ${globalCellIndex}. Must be between 0 and 80.`);
  }
  
  // Get the cell position within its small grid
  const { cellIndex } = globalToGridCell(globalCellIndex);
  
  // The next grid would be determined by the cell index
  const nextGridIndex = getNextConstrainedGrid(cellIndex);
  
  // Check if that grid is playable
  return !isGridPlayable(cells, smallGridWinners, nextGridIndex);
}

/**
 * Gets all cells that would send the opponent to a full or won grid
 * Useful for strategic play and highlighting
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of winners for each small grid
 * @returns Array of global cell indices that would trigger the full grid exception
 */
export function getFullGridExceptionTriggeringCells(
  cells: CellValue[],
  smallGridWinners: (Player | null)[]
): number[] {
  const triggeringCells: number[] = [];
  
  // Check each empty cell
  for (let i = 0; i < 81; i++) {
    if (cells[i] === null && wouldTriggerFullGridException(i, cells, smallGridWinners)) {
      triggeringCells.push(i);
    }
  }
  
  return triggeringCells;
}

/**
 * Gets all playable grids (not full and not won)
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of winners for each small grid
 * @returns Array of grid indices that are playable
 */
export function getPlayableGrids(
  cells: CellValue[],
  smallGridWinners: (Player | null)[]
): number[] {
  const playableGrids: number[] = [];
  
  for (let i = 0; i < 9; i++) {
    if (isGridPlayable(cells, smallGridWinners, i)) {
      playableGrids.push(i);
    }
  }
  
  return playableGrids;
}

/**
 * Gets the coordinates for drawing grid lines
 * @param gridSize - Size of the grid in pixels
 * @returns Array of line coordinates for drawing grid
 */
export function getGridLineCoordinates(gridSize: number): { start: number; end: number }[] {
  const cellSize = gridSize / 3;
  
  // Create coordinates for grid lines (excluding outer borders)
  return [1, 2].map(i => ({
    start: i * cellSize,
    end: gridSize
  }));
}

/**
 * Calculates the position of a cell within a grid
 * @param cellIndex - Index within the small grid (0-8)
 * @param gridSize - Size of the grid in pixels
 * @returns Object with x, y coordinates and cell size
 */
export function getCellPosition(cellIndex: number, gridSize: number): { x: number; y: number; size: number } {
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  
  const cellSize = gridSize / 3;
  const row = Math.floor(cellIndex / 3);
  const col = cellIndex % 3;
  
  return {
    x: col * cellSize,
    y: row * cellSize,
    size: cellSize
  };
}

/**
 * Determines if a cell is in a corner position
 * @param cellIndex - Index within the small grid (0-8)
 * @returns True if the cell is in a corner, false otherwise
 */
export function isCornerCell(cellIndex: number): boolean {
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  
  return [0, 2, 6, 8].includes(cellIndex);
}

/**
 * Determines if a cell is in the center position
 * @param cellIndex - Index within the small grid (0-8)
 * @returns True if the cell is in the center, false otherwise
 */
export function isCenterCell(cellIndex: number): boolean {
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  
  return cellIndex === 4;
}

/**
 * Determines if a cell is in an edge position (not corner or center)
 * @param cellIndex - Index within the small grid (0-8)
 * @returns True if the cell is on an edge, false otherwise
 */
export function isEdgeCell(cellIndex: number): boolean {
  if (cellIndex < 0 || cellIndex > 8) {
    throw new Error(`Invalid cell index: ${cellIndex}. Must be between 0 and 8.`);
  }
  
  return [1, 3, 5, 7].includes(cellIndex);
}