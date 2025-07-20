import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase, Player } from '../../types';
import { cellIndexToDisplayNumber } from '../../utils/gridUtils';
import { announceToScreenReader } from '../../utils/keyboardNavigation';
import './GameStatus.css';

/**
 * GameStatus component displays the current game state information:
 * - Current player turn
 * - Movement constraints
 * - Win announcements
 */
const GameStatus: React.FC = () => {
  const { gameState } = useGame();
  const { 
    currentPlayer, 
    gamePhase, 
    constrainedGrid, 
    gameWinner,
    firstMove
  } = gameState;
  
  // Reference to track previous state for announcements
  const prevStateRef = useRef({
    currentPlayer,
    gamePhase,
    constrainedGrid,
    gameWinner
  });
  
  // Announce game state changes to screen readers
  useEffect(() => {
    const prevState = prevStateRef.current;
    
    // Announce player turn changes
    if (prevState.currentPlayer !== currentPlayer && gamePhase === GamePhase.PLAYING) {
      announceToScreenReader(`Player ${currentPlayer}'s turn`);
    }
    
    // Announce constraint changes
    if (prevState.constrainedGrid !== constrainedGrid && gamePhase === GamePhase.PLAYING) {
      if (constrainedGrid === null) {
        announceToScreenReader('Free choice: You can play in any available grid');
      } else {
        announceToScreenReader(`You must play in grid ${constrainedGrid + 1}`);
      }
    }
    
    // Announce game phase changes
    if (prevState.gamePhase !== gamePhase) {
      if (gamePhase === GamePhase.SETUP) {
        announceToScreenReader('Game setup. Select game options to begin.');
      } else if (gamePhase === GamePhase.PLAYING) {
        announceToScreenReader('Game started. Good luck!');
      }
    }
    
    // Announce game winner
    if (gameWinner && prevState.gameWinner !== gameWinner) {
      announceToScreenReader(`Game over! Player ${gameWinner} wins the game!`);
    }
    
    // Update previous state reference
    prevStateRef.current = {
      currentPlayer,
      gamePhase,
      constrainedGrid,
      gameWinner
    };
  }, [currentPlayer, gamePhase, constrainedGrid, gameWinner]);

  /**
   * Renders the current player's turn indicator
   */
  const renderPlayerTurn = () => {
    if (gamePhase !== GamePhase.PLAYING || gameWinner) {
      return null;
    }

    return (
      <div className="game-status__player" aria-live="polite">
        <div 
          className={`game-status__player-indicator game-status__player-${currentPlayer.toLowerCase()}`}
          aria-hidden="true"
        >
          {currentPlayer}
        </div>
        <span>Player {currentPlayer}'s turn</span>
      </div>
    );
  };

  /**
   * Renders the movement constraint information
   */
  const renderConstraintInfo = () => {
    if (gamePhase !== GamePhase.PLAYING || gameWinner) {
      return null;
    }

    if (firstMove) {
      return (
        <div className="game-status__constraint" aria-live="polite">
          First move: You can play anywhere on the board
        </div>
      );
    }

    if (constrainedGrid === null) {
      return (
        <div className="game-status__constraint" aria-live="polite">
          Free choice: You can play in any available grid
        </div>
      );
    }

    const gridNumber = constrainedGrid + 1; // Convert to 1-based for display
    return (
      <div className="game-status__constraint" aria-live="polite">
        You must play in grid {gridNumber}
      </div>
    );
  };

  /**
   * Renders win announcement when game is finished
   */
  const renderWinAnnouncement = () => {
    if (gamePhase !== GamePhase.FINISHED || !gameWinner) {
      return null;
    }

    return (
      <div className="game-status__win" role="status" aria-live="assertive">
        Player {gameWinner} wins the game!
      </div>
    );
  };

  /**
   * Renders game setup information
   */
  const renderSetupInfo = () => {
    if (gamePhase !== GamePhase.SETUP) {
      return null;
    }

    return (
      <div className="game-status__constraint" aria-live="polite">
        Select game options to begin
      </div>
    );
  };

  /**
   * Renders the main title based on game phase
   */
  const renderTitle = () => {
    if (gamePhase === GamePhase.SETUP) {
      return "Game Setup";
    }
    
    if (gamePhase === GamePhase.FINISHED) {
      return "Game Over";
    }
    
    return "Tic Tac Toe Ten";
  };

  return (
    <div className="game-status" role="region" aria-label="Game status">
      <h2 className="game-status__title">{renderTitle()}</h2>
      {renderPlayerTurn()}
      {renderConstraintInfo()}
      {renderWinAnnouncement()}
      {renderSetupInfo()}
    </div>
  );
};

// Since GameStatus uses context directly, React.memo won't help much
// as it will re-render whenever the context changes
// But we'll add it anyway for consistency and in case the component is used differently in the future
export default React.memo(GameStatus);