// CPU AI implementation for Tic Tac Toe Ten
import { Player, CellValue, CPUDifficulty, GameState, GameMode } from '../types';
import { getValidMoves, globalToGridCell, gridCellToGlobal, isCornerCell, isCenterCell, isEdgeCell, wouldTriggerFullGridException, isSmallGridWon, isSmallGridFull } from './gridUtils';
import { getWinningCombinations, checkSmallGridWinner, checkForWin, checkMasterGridWinner } from './gameUtils';

/**
 * Delay for CPU move to simulate "thinking"
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Selects a random move from the list of valid moves
 * @param validMoves - Array of valid global cell indices
 * @returns A randomly selected global cell index
 */
export const selectRandomMove = (validMoves: number[]): number => {
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }
  
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
};

/**
 * Checks if a player can win in a small grid with one more move
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to check (0-8)
 * @param player - Player to check for potential win
 * @returns Global cell index that would complete a win, or null if no immediate win possible
 */
export const findWinningMove = (cells: CellValue[], gridIndex: number, player: Player): number | null => {
  // Get all winning combinations for this grid
  const winningCombinations = getWinningCombinations(gridIndex);
  
  // Check each combination for a potential win (two cells filled by player, one empty)
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    const values = [cells[a], cells[b], cells[c]];
    
    // Count player's cells and empty cells in this combination
    const playerCells = values.filter(v => v === player).length;
    const emptyCells = values.filter(v => v === null).length;
    
    // If player has two cells and one is empty, this is a winning move
    if (playerCells === 2 && emptyCells === 1) {
      // Find the empty cell index
      const emptyIndex = [a, b, c].find(index => cells[index] === null);
      if (emptyIndex !== undefined) {
        return emptyIndex;
      }
    }
  }
  
  return null;
};

/**
 * Checks if opponent can win in a small grid with one more move
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to check (0-8)
 * @param player - Current player (we'll check for opponent's potential win)
 * @returns Global cell index that would block opponent's win, or null if no immediate block needed
 */
export const findBlockingMove = (cells: CellValue[], gridIndex: number, player: Player): number | null => {
  // Determine opponent's symbol
  const opponent = player === Player.X ? Player.O : Player.X;
  
  // Use the same logic as findWinningMove but for the opponent
  return findWinningMove(cells, gridIndex, opponent);
};

/**
 * Evaluates the strategic value of a move based on cell position
 * Center > Corners > Edges
 * @param cellIndex - Cell index within a small grid (0-8)
 * @returns Score representing the strategic value (higher is better)
 */
export const evaluateCellPosition = (cellIndex: number): number => {
  if (isCenterCell(cellIndex)) {
    return 3; // Center is most valuable
  } else if (isCornerCell(cellIndex)) {
    return 2; // Corners are next
  } else {
    return 1; // Edges are least valuable
  }
};

/**
 * Evaluates a move based on whether it would send the opponent to a favorable grid
 * @param moveIndex - Global cell index of the potential move
 * @param cells - Array of all 81 cell values
 * @param smallGridWinners - Array of winners for each small grid
 * @returns Score adjustment based on grid control implications (-2 to +2)
 */
export const evaluateGridControl = (
  moveIndex: number, 
  cells: CellValue[], 
  smallGridWinners: (Player | null)[]
): number => {
  // Get the cell position within its small grid
  const { cellIndex } = globalToGridCell(moveIndex);
  
  // If this move would give opponent free choice (full grid exception), it's bad
  if (wouldTriggerFullGridException(moveIndex, cells, smallGridWinners)) {
    return 2; // Actually good for us - opponent has free choice
  }
  
  // Check if the target grid already has a strategic advantage for either player
  const targetGridIndex = cellIndex; // Smart Grid mapping rule
  
  // If the target grid has a winner or is full, this is neutral
  if (smallGridWinners[targetGridIndex] !== null) {
    return 0;
  }
  
  // Count cells in the target grid for each player
  const gridStartIndex = targetGridIndex * 9;
  const gridCells = cells.slice(gridStartIndex, gridStartIndex + 9);
  
  const xCount = gridCells.filter(cell => cell === Player.X).length;
  const oCount = gridCells.filter(cell => cell === Player.O).length;
  
  // If opponent has an advantage in the target grid, this is a bad move
  if ((xCount > oCount && oCount === 0) || (oCount > xCount && xCount === 0)) {
    return -2;
  }
  
  // If the center of the target grid is empty, this is slightly bad
  // as it gives opponent a chance to take it
  if (gridCells[4] === null) {
    return -1;
  }
  
  return 0;
};

/**
 * Selects the best move for medium difficulty AI
 * Prioritizes: 1. Winning moves, 2. Blocking moves, 3. Strategic positions
 * @param validMoves - Array of valid global cell indices
 * @param gameState - Current game state
 * @returns The selected global cell index for the move
 */
export const selectMediumDifficultyMove = (validMoves: number[], gameState: GameState): number => {
  const { cells, constrainedGrid, smallGridWinners, currentPlayer } = gameState;
  
  // If we're constrained to a specific grid, check for winning and blocking moves
  if (constrainedGrid !== null) {
    // First priority: Check if we can win in this grid
    const winningMove = findWinningMove(cells, constrainedGrid, currentPlayer);
    if (winningMove !== null && validMoves.includes(winningMove)) {
      return winningMove;
    }
    
    // Second priority: Block opponent's win
    const blockingMove = findBlockingMove(cells, constrainedGrid, currentPlayer);
    if (blockingMove !== null && validMoves.includes(blockingMove)) {
      return blockingMove;
    }
  } else {
    // We have free choice - check all grids for winning and blocking moves
    
    // First check if we can win in any grid
    for (let gridIndex = 0; gridIndex < 9; gridIndex++) {
      // Skip grids that already have a winner
      if (smallGridWinners[gridIndex] !== null) {
        continue;
      }
      
      const winningMove = findWinningMove(cells, gridIndex, currentPlayer);
      if (winningMove !== null && validMoves.includes(winningMove)) {
        return winningMove;
      }
    }
    
    // Then check if we need to block in any grid
    for (let gridIndex = 0; gridIndex < 9; gridIndex++) {
      // Skip grids that already have a winner
      if (smallGridWinners[gridIndex] !== null) {
        continue;
      }
      
      const blockingMove = findBlockingMove(cells, gridIndex, currentPlayer);
      if (blockingMove !== null && validMoves.includes(blockingMove)) {
        return blockingMove;
      }
    }
  }
  
  // If no immediate win or block, evaluate moves based on strategic value
  const moveScores = validMoves.map(moveIndex => {
    const { cellIndex } = globalToGridCell(moveIndex);
    
    // Base score from cell position (center > corners > edges)
    let score = evaluateCellPosition(cellIndex);
    
    // Adjust score based on grid control implications
    score += evaluateGridControl(moveIndex, cells, smallGridWinners);
    
    return { moveIndex, score };
  });
  
  // Sort by score (highest first)
  moveScores.sort((a, b) => b.score - a.score);
  
  // If there are multiple moves with the same highest score, choose randomly among them
  const highestScore = moveScores[0].score;
  const bestMoves = moveScores.filter(move => move.score === highestScore);
  
  const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  return selectedMove.moveIndex;
};

/**
 * Evaluates the current state of a small grid for the minimax algorithm
 * @param cells - Array of all 81 cell values
 * @param gridIndex - Index of the small grid to evaluate (0-8)
 * @param player - Player to evaluate for (usually the CPU)
 * @returns Score representing the state of the grid (higher is better for the player)
 */
export const evaluateSmallGrid = (cells: CellValue[], gridIndex: number, player: Player): number => {
  const opponent = player === Player.X ? Player.O : Player.X;
  const startIndex = gridIndex * 9;
  const gridCells = cells.slice(startIndex, startIndex + 9);
  
  // Check if this grid has a winner
  const winner = checkSmallGridWinner(cells, gridIndex);
  if (winner === player) {
    return 10; // Player has won this grid
  } else if (winner === opponent) {
    return -10; // Opponent has won this grid
  }
  
  // Count potential winning lines
  let score = 0;
  const winningCombinations = getWinningCombinations(gridIndex);
  
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    const values = [cells[a], cells[b], cells[c]];
    
    const playerCount = values.filter(v => v === player).length;
    const opponentCount = values.filter(v => v === opponent).length;
    const emptyCount = values.filter(v => v === null).length;
    
    // Player has potential to win this line
    if (playerCount > 0 && opponentCount === 0) {
      score += playerCount;
    }
    
    // Opponent has potential to win this line (negative score)
    if (opponentCount > 0 && playerCount === 0) {
      score -= opponentCount;
    }
  }
  
  // Bonus for controlling the center
  if (gridCells[4] === player) {
    score += 2;
  } else if (gridCells[4] === opponent) {
    score -= 2;
  }
  
  return score;
};

/**
 * Evaluates the entire board state for the minimax algorithm
 * @param gameState - Current game state
 * @param player - Player to evaluate for (usually the CPU)
 * @returns Score representing the state of the board (higher is better for the player)
 */
export const evaluateBoard = (gameState: GameState, player: Player): number => {
  const { cells, smallGridWinners, mode } = gameState;
  const opponent = player === Player.X ? Player.O : Player.X;
  
  // Check for game winner in extended mode
  if (mode === GameMode.EXTENDED) {
    const masterWinner = checkMasterGridWinner(smallGridWinners);
    if (masterWinner === player) {
      return 1000; // Player has won the game
    } else if (masterWinner === opponent) {
      return -1000; // Opponent has won the game
    }
  }
  
  let score = 0;
  
  // In basic mode, evaluate each small grid
  if (mode === GameMode.BASIC) {
    // Check for any grid win (game win in basic mode)
    for (let i = 0; i < 9; i++) {
      const winner = smallGridWinners[i];
      if (winner === player) {
        return 1000; // Player has won the game
      } else if (winner === opponent) {
        return -1000; // Opponent has won the game
      }
    }
    
    // Evaluate each small grid
    for (let i = 0; i < 9; i++) {
      score += evaluateSmallGrid(cells, i, player);
    }
  } else {
    // In extended mode, evaluate based on grid wins
    for (let i = 0; i < 9; i++) {
      if (smallGridWinners[i] === player) {
        score += 100; // Player has won a grid
      } else if (smallGridWinners[i] === opponent) {
        score -= 100; // Opponent has won a grid
      } else if (!isSmallGridWon(smallGridWinners, i) && !isSmallGridFull(cells, i)) {
        // Grid is still in play, evaluate its state
        score += evaluateSmallGrid(cells, i, player);
      }
    }
    
    // Evaluate potential winning combinations on the master grid
    const masterWinningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const combination of masterWinningCombinations) {
      const [a, b, c] = combination;
      const values = [smallGridWinners[a], smallGridWinners[b], smallGridWinners[c]];
      
      const playerGrids = values.filter(v => v === player).length;
      const opponentGrids = values.filter(v => v === opponent).length;
      const emptyGrids = values.filter(v => v === null).length;
      
      // Player has potential to win this line on the master grid
      if (playerGrids > 0 && opponentGrids === 0) {
        score += playerGrids * 50;
      }
      
      // Opponent has potential to win this line on the master grid
      if (opponentGrids > 0 && playerGrids === 0) {
        score -= opponentGrids * 50;
      }
    }
  }
  
  return score;
};

/**
 * Makes a simulated move and returns the new game state
 * @param gameState - Current game state
 * @param moveIndex - Global cell index to make the move
 * @returns New game state after the move
 */
export const makeSimulatedMove = (gameState: GameState, moveIndex: number): GameState => {
  const { cells, currentPlayer, constrainedGrid, smallGridWinners, firstMove } = gameState;
  
  // Create copies of state to avoid modifying the original
  const newCells = [...cells];
  const newSmallGridWinners = [...smallGridWinners];
  
  // Make the move
  newCells[moveIndex] = currentPlayer;
  
  // Check if this move won a small grid
  const { gridIndex } = globalToGridCell(moveIndex);
  const { winner } = checkForWin(newCells, gridIndex);
  if (winner) {
    newSmallGridWinners[gridIndex] = winner;
  }
  
  // Calculate the new constrained grid
  const { cellIndex } = globalToGridCell(moveIndex);
  let newConstrainedGrid: number | null = cellIndex;
  
  // Check if the target grid is full or won
  if (isSmallGridWon(newSmallGridWinners, newConstrainedGrid) || 
      isSmallGridFull(newCells, newConstrainedGrid)) {
    newConstrainedGrid = null; // Free choice
  }
  
  // Switch player
  const newCurrentPlayer = currentPlayer === Player.X ? Player.O : Player.X;
  
  return {
    ...gameState,
    cells: newCells,
    smallGridWinners: newSmallGridWinners,
    currentPlayer: newCurrentPlayer,
    constrainedGrid: newConstrainedGrid,
    firstMove: false
  };
};

/**
 * Minimax algorithm with alpha-beta pruning for optimal move selection
 * @param gameState - Current game state
 * @param depth - Current search depth
 * @param alpha - Alpha value for pruning
 * @param beta - Beta value for pruning
 * @param isMaximizing - Whether this is a maximizing node
 * @returns Best score for this branch
 */
export const minimax = (
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number => {
  const { cells, constrainedGrid, smallGridWinners, firstMove, currentPlayer } = gameState;
  const cpuPlayer = currentPlayer; // The player who is making the decision
  
  // Terminal conditions: max depth reached or game over
  if (depth === 0) {
    return evaluateBoard(gameState, cpuPlayer);
  }
  
  // Get valid moves
  const validMoves = getValidMoves(cells, constrainedGrid, smallGridWinners, firstMove);
  
  // No valid moves or game over
  if (validMoves.length === 0) {
    return evaluateBoard(gameState, cpuPlayer);
  }
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    
    for (const moveIndex of validMoves) {
      // Make a simulated move
      const newGameState = makeSimulatedMove(gameState, moveIndex);
      
      // Recursively evaluate this move
      const score = minimax(newGameState, depth - 1, alpha, beta, false);
      
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }
    
    return maxScore;
  } else {
    let minScore = Infinity;
    
    for (const moveIndex of validMoves) {
      // Make a simulated move
      const newGameState = makeSimulatedMove(gameState, moveIndex);
      
      // Recursively evaluate this move
      const score = minimax(newGameState, depth - 1, alpha, beta, true);
      
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }
    
    return minScore;
  }
};

/**
 * Selects the best move using the minimax algorithm with alpha-beta pruning
 * @param validMoves - Array of valid global cell indices
 * @param gameState - Current game state
 * @returns The selected global cell index for the move
 */
export const selectHardDifficultyMove = (validMoves: number[], gameState: GameState): number => {
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }
  
  const { cells, constrainedGrid, smallGridWinners, currentPlayer } = gameState;
  
  // First priority: Check for immediate winning moves
  if (constrainedGrid !== null) {
    const winningMove = findWinningMove(cells, constrainedGrid, currentPlayer);
    if (winningMove !== null && validMoves.includes(winningMove)) {
      return winningMove;
    }
    
    // Second priority: Block opponent's win
    const blockingMove = findBlockingMove(cells, constrainedGrid, currentPlayer);
    if (blockingMove !== null && validMoves.includes(blockingMove)) {
      return blockingMove;
    }
  } else {
    // Free choice - check all grids for winning and blocking moves
    for (let gridIndex = 0; gridIndex < 9; gridIndex++) {
      // Skip grids that already have a winner
      if (smallGridWinners[gridIndex] !== null) {
        continue;
      }
      
      const winningMove = findWinningMove(cells, gridIndex, currentPlayer);
      if (winningMove !== null && validMoves.includes(winningMove)) {
        return winningMove;
      }
    }
    
    // Then check if we need to block in any grid
    for (let gridIndex = 0; gridIndex < 9; gridIndex++) {
      // Skip grids that already have a winner
      if (smallGridWinners[gridIndex] !== null) {
        continue;
      }
      
      const blockingMove = findBlockingMove(cells, gridIndex, currentPlayer);
      if (blockingMove !== null && validMoves.includes(blockingMove)) {
        return blockingMove;
      }
    }
  }
  
  // If no immediate win or block, use minimax for strategic play
  
  // For the first move or if there are many valid moves, limit the search depth
  // to improve performance
  const searchDepth = validMoves.length > 20 ? 2 : 
                     validMoves.length > 10 ? 3 : 4;
  
  let bestScore = -Infinity;
  let bestMove = validMoves[0]; // Default to first valid move
  
  // Try each valid move and evaluate using minimax
  for (const moveIndex of validMoves) {
    // Make a simulated move
    const newGameState = makeSimulatedMove(gameState, moveIndex);
    
    // Evaluate this move using minimax
    const score = minimax(newGameState, searchDepth, -Infinity, Infinity, false);
    
    // Update best move if this one is better
    if (score > bestScore) {
      bestScore = score;
      bestMove = moveIndex;
    }
    
    // Prefer center cells when scores are equal
    if (score === bestScore) {
      const { cellIndex: currentCellIndex } = globalToGridCell(moveIndex);
      const { cellIndex: bestCellIndex } = globalToGridCell(bestMove);
      
      if (isCenterCell(currentCellIndex) && !isCenterCell(bestCellIndex)) {
        bestMove = moveIndex;
      }
    }
  }
  
  return bestMove;
};

/**
 * Makes a CPU move based on the current game state and difficulty
 * @param gameState - Current game state
 * @returns Promise that resolves to the selected move index
 */
export const makeCPUMove = async (gameState: GameState): Promise<number> => {
  const { cells, constrainedGrid, smallGridWinners, firstMove, cpuDifficulty } = gameState;
  
  // Get all valid moves based on current constraints
  const validMoves = getValidMoves(cells, constrainedGrid, smallGridWinners, firstMove);
  
  if (validMoves.length === 0) {
    throw new Error('No valid moves available for CPU');
  }
  
  // Add a delay to simulate "thinking"
  const thinkingTime = cpuDifficulty === CPUDifficulty.EASY ? 500 : 
                      cpuDifficulty === CPUDifficulty.MEDIUM ? 1000 : 
                      cpuDifficulty === CPUDifficulty.HARD ? 1500 : 2500; // Expert: 2.5s
  await delay(thinkingTime);
  
  // Select move based on difficulty
  switch (cpuDifficulty) {
    case CPUDifficulty.EXPERT:
      return selectExpertDifficultyMove(validMoves, gameState);
      
    case CPUDifficulty.HARD:
      return selectHardDifficultyMove(validMoves, gameState);
      
    case CPUDifficulty.MEDIUM:
      return selectMediumDifficultyMove(validMoves, gameState);
    
    case CPUDifficulty.EASY:
    default:
      // Easy difficulty just makes random moves
      return selectRandomMove(validMoves);
  }
};

/**
 * Validates if a CPU move is legal
 * @param moveIndex - Global cell index of the proposed move
 * @param gameState - Current game state
 * @returns True if the move is valid, false otherwise
 */
export const validateCPUMove = (moveIndex: number, gameState: GameState): boolean => {
  const { cells, constrainedGrid, smallGridWinners, firstMove } = gameState;
  
  // Get all valid moves based on current constraints
  const validMoves = getValidMoves(cells, constrainedGrid, smallGridWinners, firstMove);
  
  // Check if the proposed move is in the list of valid moves
  return validMoves.includes(moveIndex);
};
/**

 * EXPERT AI IMPLEMENTATION - All Six Improvements
 */

/**
 * Opening book for Expert AI - proven opening strategies
 */
const OPENING_BOOK = {
  // First move preferences (global cell indices)
  firstMoves: [40, 36, 44, 4, 76], // Center of center grid, then strategic corners
  
  // Response patterns for common openings
  responses: {
    // If opponent takes center of center grid (40), take a corner of center grid
    40: [36, 38, 54, 56],
    // If opponent takes corner of center grid, take center
    36: [40], 38: [40], 54: [40], 56: [40],
    // Strategic responses for edge grids
    4: [40, 36], 76: [40, 44]
  }
};

/**
 * Evaluates master grid strategy - prioritizes moves that help win the overall game
 * @param gameState - Current game state
 * @param moveIndex - Potential move to evaluate
 * @param player - Player making the move
 * @returns Strategic score for master grid implications
 */
export const evaluateMasterGridStrategy = (
  gameState: GameState, 
  moveIndex: number, 
  player: Player
): number => {
  const { smallGridWinners, mode } = gameState;
  
  // Only applies to extended mode
  if (mode !== GameMode.EXTENDED) return 0;
  
  const { gridIndex } = globalToGridCell(moveIndex);
  const opponent = player === Player.X ? Player.O : Player.X;
  
  let score = 0;
  
  // Check all master grid winning combinations
  const masterCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  
  for (const combo of masterCombinations) {
    if (!combo.includes(gridIndex)) continue;
    
    const values = combo.map(i => smallGridWinners[i]);
    const playerCount = values.filter(v => v === player).length;
    const opponentCount = values.filter(v => v === opponent).length;
    const emptyCount = values.filter(v => v === null).length;
    
    // Prioritize completing master grid lines
    if (playerCount === 2 && emptyCount === 1) {
      score += 200; // Very high priority for winning master grid
    } else if (playerCount === 1 && emptyCount === 2) {
      score += 50; // Good to build master grid lines
    }
    
    // Block opponent's master grid lines
    if (opponentCount === 2 && emptyCount === 1) {
      score += 150; // High priority to block opponent's master win
    } else if (opponentCount === 1 && emptyCount === 2) {
      score += 30; // Moderate priority to disrupt opponent
    }
  }
  
  // Bonus for center grid control in master grid
  if (gridIndex === 4) {
    score += 25;
  }
  
  // Bonus for corner grids in master grid
  if ([0, 2, 6, 8].includes(gridIndex)) {
    score += 15;
  }
  
  return score;
};

/**
 * Detects and sets up traps - multi-move strategies that force opponent into bad positions
 * @param gameState - Current game state
 * @param moveIndex - Potential move to evaluate
 * @param player - Player making the move
 * @returns Score for trap potential
 */
export const evaluateTrapSetting = (
  gameState: GameState,
  moveIndex: number,
  player: Player
): number => {
  const { cells, smallGridWinners } = gameState;
  const { gridIndex, cellIndex } = globalToGridCell(moveIndex);
  
  let score = 0;
  
  // Simulate the move to see future possibilities
  const newCells = [...cells];
  newCells[moveIndex] = player;
  
  // Check if this move creates multiple threats
  let threatCount = 0;
  
  // Check all grids for potential threats after this move
  for (let i = 0; i < 9; i++) {
    if (smallGridWinners[i] !== null) continue;
    
    const winningMove = findWinningMove(newCells, i, player);
    if (winningMove !== null) {
      threatCount++;
    }
  }
  
  // Bonus for creating multiple threats
  if (threatCount >= 2) {
    score += 75; // Creating multiple threats is very valuable
  } else if (threatCount === 1) {
    score += 25;
  }
  
  // Check if move forces opponent into a difficult position
  const targetGrid = cellIndex; // Where opponent will be sent
  if (targetGrid !== null && smallGridWinners[targetGrid] === null) {
    const opponentMoves = getValidMoves(newCells, targetGrid, smallGridWinners, false);
    
    // If opponent has very few options, this is good for us
    if (opponentMoves.length <= 2) {
      score += 40;
    } else if (opponentMoves.length <= 4) {
      score += 20;
    }
  }
  
  return score;
};

/**
 * Enhanced position evaluation with deeper strategic analysis
 * @param gameState - Current game state
 * @param moveIndex - Move to evaluate
 * @param player - Player making the move
 * @returns Comprehensive position score
 */
export const evaluatePositionAdvanced = (
  gameState: GameState,
  moveIndex: number,
  player: Player
): number => {
  const { cells, smallGridWinners } = gameState;
  const { gridIndex, cellIndex } = globalToGridCell(moveIndex);
  
  let score = 0;
  
  // Basic position value
  score += evaluateCellPosition(cellIndex);
  
  // Grid control implications
  score += evaluateGridControl(moveIndex, cells, smallGridWinners);
  
  // Master grid strategy (Extended mode)
  score += evaluateMasterGridStrategy(gameState, moveIndex, player);
  
  // Trap setting potential
  score += evaluateTrapSetting(gameState, moveIndex, player);
  
  // Tempo considerations - controlling the flow of the game
  const opponent = player === Player.X ? Player.O : Player.X;
  
  // Check if this move gives us tempo advantage
  const targetGrid = cellIndex;
  if (targetGrid !== null && smallGridWinners[targetGrid] === null) {
    // Count our pieces vs opponent's pieces in target grid
    const gridStart = targetGrid * 9;
    const gridCells = cells.slice(gridStart, gridStart + 9);
    
    const ourCount = gridCells.filter(cell => cell === player).length;
    const theirCount = gridCells.filter(cell => cell === opponent).length;
    
    if (ourCount > theirCount) {
      score += 15; // Good tempo - sending them to our strong grid
    } else if (theirCount > ourCount) {
      score -= 10; // Bad tempo - sending them to their strong grid
    }
  }
  
  return score;
};

/**
 * Checks opening book for optimal moves
 * @param gameState - Current game state
 * @param validMoves - Available moves
 * @returns Opening book move or null if not applicable
 */
export const checkOpeningBook = (gameState: GameState, validMoves: number[]): number | null => {
  const { cells, firstMove } = gameState;
  
  // Count total moves made
  const moveCount = cells.filter(cell => cell !== null).length;
  
  // First move
  if (firstMove || moveCount === 0) {
    for (const move of OPENING_BOOK.firstMoves) {
      if (validMoves.includes(move)) {
        return move;
      }
    }
  }
  
  // Second move (response to opponent's first move)
  if (moveCount === 1) {
    const opponentMove = cells.findIndex(cell => cell !== null);
    const responses = OPENING_BOOK.responses as Record<number, number[]>;
    if (opponentMove !== -1 && responses[opponentMove]) {
      for (const response of responses[opponentMove]) {
        if (validMoves.includes(response)) {
          return response;
        }
      }
    }
  }
  
  return null;
};

/**
 * Expert difficulty AI with all six improvements implemented
 * @param validMoves - Array of valid global cell indices
 * @param gameState - Current game state
 * @returns The selected global cell index for the move
 */
export const selectExpertDifficultyMove = (validMoves: number[], gameState: GameState): number => {
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }
  
  const { cells, constrainedGrid, smallGridWinners, currentPlayer } = gameState;
  
  // 1. Check opening book first
  const openingMove = checkOpeningBook(gameState, validMoves);
  if (openingMove !== null) {
    return openingMove;
  }
  
  // 2. Immediate winning moves (highest priority)
  if (constrainedGrid !== null) {
    const winningMove = findWinningMove(cells, constrainedGrid, currentPlayer);
    if (winningMove !== null && validMoves.includes(winningMove)) {
      return winningMove;
    }
    
    // Block opponent's immediate wins
    const blockingMove = findBlockingMove(cells, constrainedGrid, currentPlayer);
    if (blockingMove !== null && validMoves.includes(blockingMove)) {
      return blockingMove;
    }
  } else {
    // Free choice - check all grids for winning and blocking moves
    for (let gridIndex = 0; gridIndex < 9; gridIndex++) {
      if (smallGridWinners[gridIndex] !== null) continue;
      
      const winningMove = findWinningMove(cells, gridIndex, currentPlayer);
      if (winningMove !== null && validMoves.includes(winningMove)) {
        return winningMove;
      }
    }
    
    // Block opponent wins in any grid
    for (let gridIndex = 0; gridIndex < 9; gridIndex++) {
      if (smallGridWinners[gridIndex] !== null) continue;
      
      const blockingMove = findBlockingMove(cells, gridIndex, currentPlayer);
      if (blockingMove !== null && validMoves.includes(blockingMove)) {
        return blockingMove;
      }
    }
  }
  
  // 3. Use enhanced minimax with increased depth (5-6 moves lookahead)
  const searchDepth = validMoves.length > 30 ? 4 : 
                     validMoves.length > 20 ? 5 : 6; // Increased depth
  
  let bestScore = -Infinity;
  let bestMove = validMoves[0];
  
  // Evaluate each move with comprehensive analysis
  for (const moveIndex of validMoves) {
    let score = 0;
    
    // Advanced position evaluation
    score += evaluatePositionAdvanced(gameState, moveIndex, currentPlayer);
    
    // Minimax evaluation with deeper search
    const newGameState = makeSimulatedMove(gameState, moveIndex);
    const minimaxScore = minimax(newGameState, searchDepth, -Infinity, Infinity, false);
    score += minimaxScore;
    
    // Update best move
    if (score > bestScore) {
      bestScore = score;
      bestMove = moveIndex;
    }
    
    // Tiebreaker: prefer center cells, then corners
    if (score === bestScore) {
      const { cellIndex: currentCellIndex } = globalToGridCell(moveIndex);
      const { cellIndex: bestCellIndex } = globalToGridCell(bestMove);
      
      if (isCenterCell(currentCellIndex) && !isCenterCell(bestCellIndex)) {
        bestMove = moveIndex;
      } else if (!isCenterCell(currentCellIndex) && !isCenterCell(bestCellIndex) &&
                 isCornerCell(currentCellIndex) && !isCornerCell(bestCellIndex)) {
        bestMove = moveIndex;
      }
    }
  }
  
  return bestMove;
};