import { GameState, Player, GamePhase, GameMode } from '../types';

/**
 * Utility functions for game validation, error handling, and win detection
 */

/**
 * Validates a move and returns an error message if invalid
 * @param gameState - Current game state
 * @param cellIndex - Global index of the cell (0-80)
 * @returns Error message if move is invalid, null otherwise
 */
export const validateMove = (gameState: GameState, cellIndex: number): string | null => {
  const { cells, constrainedGrid, firstMove, gamePhase } = gameState;
  
  // Game must be in playing phase
  if (gamePhase !== GamePhase.PLAYING) {
    return "Game is not in progress";
  }
  
  // Cell must be within valid range
  if (cellIndex < 0 || cellIndex >= 81) {
    return "Invalid cell index";
  }
  
  // Cell must be empty
  if (cells[cellIndex] !== null) {
    return "This cell is already occupied";
  }
  
  // First move can be anywhere
  if (firstMove) {
    return null;
  }
  
  // If no constraint, any empty cell is playable
  if (constrainedGrid === null) {
    return null;
  }
  
  // Otherwise, cell must be in the constrained grid
  const gridIndex = Math.floor(cellIndex / 9);
  if (gridIndex !== constrainedGrid) {
    return `You must play in grid ${constrainedGrid + 1}`;
  }
  
  return null;
};

/**
 * Validates game state for consistency
 * @param gameState - Current game state
 * @returns Array of error messages if state is invalid, empty array otherwise
 */
export const validateGameState = (gameState: GameState): string[] => {
  const errors: string[] = [];
  
  // Check that cells array has correct length
  if (gameState.cells.length !== 81) {
    errors.push("Invalid cells array length");
  }
  
  // Check that smallGridWinners array has correct length
  if (gameState.smallGridWinners.length !== 9) {
    errors.push("Invalid smallGridWinners array length");
  }
  
  // Check that constrainedGrid is valid
  if (gameState.constrainedGrid !== null && 
      (gameState.constrainedGrid < 0 || gameState.constrainedGrid > 8)) {
    errors.push("Invalid constrainedGrid value");
  }
  
  // Check that current player is valid
  if (gameState.currentPlayer !== Player.X && gameState.currentPlayer !== Player.O) {
    errors.push("Invalid currentPlayer value");
  }
  
  return errors;
};

/**
 * Handles errors in the game flow
 * @param error - Error object or message
 * @returns Formatted error message for display
 */
export const handleGameError = (error: Error | string): string => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Log error for debugging
  console.error("Game error:", errorMessage);
  
  // Return user-friendly message
  if (errorMessage.includes("cells array")) {
    return "Game state error: Please reset the game";
  }
  
  if (errorMessage.includes("constrainedGrid")) {
    return "Game state error: Invalid grid constraint";
  }
  
  // Default error message
  return "An error occurred. Please try resetting the game.";
};

/**
 * Checks if the game is in a valid state to continue
 * @param gameState - Current game state
 * @returns Boolean indicating if game can continue
 */
export const canGameContinue = (gameState: GameState): boolean => {
  // Game must be in playing phase
  if (gameState.gamePhase !== GamePhase.PLAYING) {
    return false;
  }
  
  // Game must not have a winner
  if (gameState.gameWinner !== null) {
    return false;
  }
  
  // There must be at least one empty cell
  if (!gameState.cells.some(cell => cell === null)) {
    return false;
  }
  
  return true;
};

/**
 * Gets a user-friendly error message for a specific error code
 * @param errorCode - Error code or identifier
 * @returns User-friendly error message
 */
export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'cell-occupied': "This cell is already occupied",
    'wrong-grid': "You must play in the highlighted grid",
    'game-over': "The game has ended",
    'not-your-turn': "It's not your turn",
    'invalid-move': "Invalid move",
    'cpu-thinking': "CPU is thinking...",
    'network-error': "Network error. Please try again.",
    'state-error': "Game state error. Please reset the game."
  };
  
  return errorMessages[errorCode] || "An error occurred";
};
/**

 * Win Detection Functions
 */

/**
 * Gets all possible winning combinations for a specific small grid
 * @param gridIndex - Index of the small grid (0-8)
 * @returns Array of winning combinations, each containing 3 global cell indices
 */
export function getWinningCombinations(gridIndex: number): number[][] {
  const baseIndex = gridIndex * 9;
  
  return [
    // Rows
    [baseIndex, baseIndex + 1, baseIndex + 2],
    [baseIndex + 3, baseIndex + 4, baseIndex + 5],
    [baseIndex + 6, baseIndex + 7, baseIndex + 8],
    
    // Columns
    [baseIndex, baseIndex + 3, baseIndex + 6],
    [baseIndex + 1, baseIndex + 4, baseIndex + 7],
    [baseIndex + 2, baseIndex + 5, baseIndex + 8],
    
    // Diagonals
    [baseIndex, baseIndex + 4, baseIndex + 8],
    [baseIndex + 2, baseIndex + 4, baseIndex + 6]
  ];
}

/**
 * Checks if a specific small grid has a winner
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to check (0-8)
 * @returns The winning player or null if no winner
 */
export function checkSmallGridWinner(cells: (Player | null)[], gridIndex: number): Player | null {
  const combinations = getWinningCombinations(gridIndex);
  
  for (const combo of combinations) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  
  return null;
}

/**
 * Gets the winning cells for a specific small grid
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to check (0-8)
 * @returns Array of winning cell indices, or empty array if no winner
 */
export function getSmallGridWinningCells(cells: (Player | null)[], gridIndex: number): number[] {
  const combinations = getWinningCombinations(gridIndex);
  
  for (const combo of combinations) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return combo;
    }
  }
  
  return [];
}

/**
 * Checks for a win and returns winner and winning cells
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to check (0-8)
 * @returns Object with winner and winning cells
 */
export function checkForWin(cells: (Player | null)[], gridIndex: number): {
  winner: Player | null;
  winningCells: number[];
} {
  const winner = checkSmallGridWinner(cells, gridIndex);
  const winningCells = winner ? getSmallGridWinningCells(cells, gridIndex) : [];
  
  return { winner, winningCells };
}

/**
 * Gets all possible winning combinations for the master grid
 * @returns Array of winning combinations, each containing 3 grid indices
 */
function getMasterGridWinningCombinations(): number[][] {
  return [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    
    // Diagonals
    [0, 4, 8],
    [2, 4, 6]
  ];
}

/**
 * Checks if the master grid has a winner (for extended mode)
 * @param smallGridWinners - Array of small grid winners
 * @returns The winning player or null if no winner
 */
export function checkMasterGridWinner(smallGridWinners: (Player | null)[]): Player | null {
  const combinations = getMasterGridWinningCombinations();
  
  for (const combo of combinations) {
    const [a, b, c] = combo;
    if (smallGridWinners[a] && 
        smallGridWinners[a] === smallGridWinners[b] && 
        smallGridWinners[a] === smallGridWinners[c]) {
      return smallGridWinners[a];
    }
  }
  
  return null;
}

/**
 * Gets the winning grid indices for the master grid
 * @param smallGridWinners - Array of small grid winners
 * @returns Array of winning grid indices, or empty array if no winner
 */
export function getMasterGridWinningGrids(smallGridWinners: (Player | null)[]): number[] {
  const combinations = getMasterGridWinningCombinations();
  
  for (const combo of combinations) {
    const [a, b, c] = combo;
    if (smallGridWinners[a] && 
        smallGridWinners[a] === smallGridWinners[b] && 
        smallGridWinners[a] === smallGridWinners[c]) {
      return combo;
    }
  }
  
  return [];
}

/**
 * Converts winning grid indices to all winning cell indices
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of small grid winners
 * @param winningGrids - Array of winning grid indices
 * @returns Array of all winning cell indices
 */
export function getMasterGridWinningCells(
  cells: (Player | null)[],
  smallGridWinners: (Player | null)[],
  winningGrids: number[]
): number[] {
  const allWinningCells: number[] = [];
  
  for (const gridIndex of winningGrids) {
    const gridWinningCells = getSmallGridWinningCells(cells, gridIndex);
    allWinningCells.push(...gridWinningCells);
  }
  
  return allWinningCells;
}

/**
 * Checks for game winner based on mode
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of small grid winners
 * @param mode - Game mode (basic or extended)
 * @returns Object with winner and winning cells
 */
export function checkGameWinner(
  cells: (Player | null)[],
  smallGridWinners: (Player | null)[],
  mode: GameMode
): {
  winner: Player | null;
  winningCells: number[];
} {
  if (mode === GameMode.BASIC) {
    // In basic mode, first small grid win wins the game
    for (let i = 0; i < 9; i++) {
      const winner = checkSmallGridWinner(cells, i);
      if (winner) {
        const winningCells = getSmallGridWinningCells(cells, i);
        return { winner, winningCells };
      }
    }
  } else {
    // In extended mode, need to win the master grid
    const masterWinner = checkMasterGridWinner(smallGridWinners);
    if (masterWinner) {
      const winningGrids = getMasterGridWinningGrids(smallGridWinners);
      const winningCells = getMasterGridWinningCells(cells, smallGridWinners, winningGrids);
      return { winner: masterWinner, winningCells };
    }
  }
  
  return { winner: null, winningCells: [] };
}