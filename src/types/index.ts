// Core game types for Tic Tac Toe Ten

/**
 * Enums for better type safety and clarity
 */

/**
 * Player enum representing the two players in the game
 */
export enum Player {
  X = 'X',
  O = 'O'
}

/**
 * Game modes available in Tic Tac Toe Ten
 */
export enum GameMode {
  BASIC = 'basic',     // Win by getting three in a row in any small grid
  EXTENDED = 'extended' // Win by winning three small grids in a row
}

/**
 * Player modes for determining opponents
 */
export enum PlayerMode {
  HUMAN_VS_HUMAN = 'human-vs-human',
  HUMAN_VS_CPU = 'human-vs-cpu'
}

/**
 * Game phases representing the current state of the game
 */
export enum GamePhase {
  SETUP = 'setup',     // Initial setup phase (selecting modes)
  PLAYING = 'playing', // Active gameplay
  FINISHED = 'finished' // Game has ended with a winner or draw
}

/**
 * CPU difficulty levels for AI opponent
 */
export enum CPUDifficulty {
  EASY = 'easy',     // Random valid moves
  MEDIUM = 'medium', // Basic strategy (win/block)
  HARD = 'hard',     // Advanced strategy with lookahead
  EXPERT = 'expert'  // Master-level strategy with deep analysis
}

/**
 * Type aliases for convenience and better type checking
 */
export type PlayerType = Player.X | Player.O;
export type CellValue = PlayerType | null;
export type GameModeType = GameMode.BASIC | GameMode.EXTENDED;
export type PlayerModeType = PlayerMode.HUMAN_VS_HUMAN | PlayerMode.HUMAN_VS_CPU;
export type GamePhaseType = GamePhase.SETUP | GamePhase.PLAYING | GamePhase.FINISHED;
export type CPUDifficultyType = CPUDifficulty.EASY | CPUDifficulty.MEDIUM | CPUDifficulty.HARD | CPUDifficulty.EXPERT;

/**
 * Position in the 9x9 grid (0-8 for both row and column)
 */
export interface GridPosition {
  row: number; // 0-8
  col: number; // 0-8
}

/**
 * Represents the state of an individual cell in the game
 */
export interface CellState {
  value: CellValue;     // X, O, or null (empty)
  globalIndex: number;  // 0-80 (position in the entire board)
  gridIndex: number;    // 0-8 (which small grid this cell belongs to)
  cellIndex: number;    // 0-8 (position within the small grid)
  isPlayable: boolean;  // Whether this cell can be played in the current turn
  isWinning: boolean;   // Whether this cell is part of a winning combination
}

/**
 * Represents the state of a small 3x3 grid
 */
export interface GridState {
  index: number;           // 0-8 (position in the master grid)
  cells: CellValue[];      // 9 cell values within this grid
  winner: Player | null;   // Player who won this grid, or null
  isComplete: boolean;     // Whether all cells are filled or grid is won
  isConstrained: boolean;  // Whether this grid is the only playable area
}

/**
 * Represents the complete state of the game
 */
export interface GameState {
  // Game configuration
  mode: GameMode;           // Basic or extended mode
  playerMode: PlayerMode;   // Human vs human or human vs CPU
  cpuDifficulty: CPUDifficulty; // Difficulty level for CPU opponent
  
  // Current game state
  currentPlayer: Player;    // Whose turn it is (X or O)
  gamePhase: GamePhase;     // Current phase of the game
  firstMove: boolean;       // Whether this is the first move of the game
  
  // Board state
  constrainedGrid: number | null; // Which grid (0-8) is playable, or null for free choice
  cells: CellValue[];       // Flat array of 81 cell values
  
  // Win state
  smallGridWinners: (Player | null)[]; // Winner of each small grid (9 elements)
  gameWinner: Player | null; // Overall game winner
  winningCells: number[];    // Global indices of cells that form winning combination
}

/**
 * Represents a move in the game
 */
export interface Move {
  globalIndex: number;  // 0-80 (position in the entire board)
  player: Player;       // Which player made the move
}

/**
 * Represents a winning combination in a grid
 */
export interface WinningCombination {
  indices: number[];    // Indices of the winning cells
  player: Player;       // Player who achieved the win
  type: 'row' | 'column' | 'diagonal'; // Type of win
}

/**
 * Represents the result of a game
 */
export interface GameResult {
  winner: Player | null;  // Winner of the game, null for draw
  winningCells: number[]; // Indices of winning cells
  isDraw: boolean;        // Whether the game ended in a draw
}

/**
 * Union type of all possible actions that can be dispatched to the game reducer
 */
export type GameAction = 
  | { type: 'MAKE_MOVE'; payload: { cellIndex: number; player: Player } }
  | { type: 'SET_GAME_MODE'; payload: GameMode }
  | { type: 'SET_PLAYER_MODE'; payload: PlayerMode }
  | { type: 'SET_CPU_DIFFICULTY'; payload: CPUDifficulty }
  | { type: 'UPDATE_WINNING_STATE'; payload: { 
      smallGridWinners: (Player | null)[]; 
      gameWinner: Player | null;
      winningCells: number[];
    }}
  | { type: 'RESET_GAME' }
  | { type: 'NEW_GAME' }
  | { type: 'START_GAME' };