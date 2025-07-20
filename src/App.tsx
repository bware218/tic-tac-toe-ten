import React, { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import './styles/accessibility.css'; // Import accessibility styles
import './styles/animations.css'; // Import optimized animations
import { GameProvider } from './context/GameContext';
import { useCPUMove } from './hooks/useCPUMove';
import { useGame } from './context/GameContext';
import CPUThinking from './components/CPUThinking/CPUThinking';
import MasterGrid from './components/MasterGrid/MasterGrid';
import GameStatus from './components/GameStatus/GameStatus';
import GameControls from './components/GameControls/GameControls';
import GameModeSelector from './components/GameModeSelector/GameModeSelector';
import PlayerModeSelector from './components/PlayerModeSelector/PlayerModeSelector';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import BusinessBabies from './components/BusinessBabies/BusinessBabies';
import { GamePhase, PlayerMode } from './types';
import { shouldBlockPlayerInput, isCellPlayable } from './utils/gameFlowManager';
import { validateMove, validateGameState, handleGameError } from './utils/gameUtils';
import { announceToScreenReader } from './utils/keyboardNavigation';
import { useDebounce, useThrottle } from './utils/performanceUtils';
import { applyBrowserFixes, logBrowserInfo } from './utils/browserCompatibility';
import { startPerformanceMonitoring, getPerformanceMetrics } from './utils/performanceMonitor';

// Main App component wrapper that provides game context
function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

// Inner component that can use the game context
const AppContent = React.memo(() => {
  const { gameState, dispatch } = useGame();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasStateError, setHasStateError] = useState<boolean>(false);
  
  // Define isCPUThinking state first to avoid the variable used before declaration error
  const [localIsCPUThinking, setLocalIsCPUThinking] = useState<boolean>(false);
  
  // Apply browser compatibility fixes and start performance monitoring on component mount
  useEffect(() => {
    // Apply browser-specific fixes and optimizations
    applyBrowserFixes();
    
    // Start performance monitoring
    startPerformanceMonitoring();
    
    // Log browser information for debugging
    if (process.env.NODE_ENV === 'development') {
      logBrowserInfo();
    }
    
    // Log performance metrics periodically in development mode
    let metricsInterval: NodeJS.Timeout | null = null;
    if (process.env.NODE_ENV === 'development') {
      metricsInterval = setInterval(() => {
        const metrics = getPerformanceMetrics();
        console.log(`Performance metrics - FPS: ${metrics.fps.toFixed(1)}, Frame time: ${metrics.frameTime.toFixed(1)}ms`);
      }, 5000);
    }
    
    // Clean up interval on unmount
    return () => {
      if (metricsInterval) {
        clearInterval(metricsInterval);
      }
    };
  }, []);
  
  // Validate game state
  useEffect(() => {
    try {
      const errors = validateGameState(gameState);
      if (errors.length > 0) {
        console.error('Game state validation errors:', errors);
        setHasStateError(true);
        setErrorMessage('Game state error detected. Please reset the game.');
      } else {
        setHasStateError(false);
      }
    } catch (error) {
      console.error('Error validating game state:', error);
      setHasStateError(true);
      setErrorMessage('An unexpected error occurred. Please reset the game.');
    }
  }, [gameState]);
  
  // Handle errors safely
  const handleError = useCallback((error: Error | string) => {
    const message = handleGameError(error);
    setErrorMessage(message);
    
    // Log error for debugging
    if (typeof error === 'string') {
      console.error('Game error:', error);
    } else {
      console.error('Game error:', error.message, error.stack);
    }
  }, []);
  
  // Handle CPU moves (bypasses human player validation)
  const handleCPUMove = useCallback((cellIndex: number) => {
    try {
      // Make the move directly for CPU
      dispatch({
        type: 'MAKE_MOVE',
        payload: { cellIndex, player: gameState.currentPlayer }
      });
      
      // Announce the CPU move to screen readers
      announceToScreenReader(`CPU placed ${gameState.currentPlayer} at cell ${cellIndex % 9 + 1}`, "polite");
    } catch (error) {
      handleError(error as Error);
    }
  }, [gameState.currentPlayer, dispatch, handleError]);

  // Handle cell clicks with validation - using throttle to prevent rapid clicks
  const handleCellClickBase = useCallback((cellIndex: number) => {
    // Clear any previous error messages
    setErrorMessage(null);
    
    try {
      // Check if game state has errors
      if (hasStateError) {
        setErrorMessage('Please reset the game to continue.');
        return;
      }
      
      // Check if player input should be blocked
      if (shouldBlockPlayerInput(gameState, localIsCPUThinking)) {
        if (gameState.gamePhase !== GamePhase.PLAYING) {
          return; // Silently ignore clicks when game is not in playing phase
        }
        
        if (localIsCPUThinking) {
          setErrorMessage("Please wait for CPU to make its move");
          announceToScreenReader("Please wait for CPU to make its move", "assertive");
          return;
        }
        
        return;
      }
      
      // Validate the move
      const validationError = validateMove(gameState, cellIndex);
      if (validationError) {
        setErrorMessage(validationError);
        announceToScreenReader(validationError, "assertive");
        return;
      }
      
      // Make the move
      dispatch({
        type: 'MAKE_MOVE',
        payload: { cellIndex, player: gameState.currentPlayer }
      });
      
      // Announce the move to screen readers
      announceToScreenReader(`Player ${gameState.currentPlayer} placed at cell ${cellIndex % 9 + 1}`, "polite");
    } catch (error) {
      handleError(error as Error);
    }
  }, [gameState, localIsCPUThinking, hasStateError, dispatch, handleError]);
  
  // Throttle the click handler to prevent accidental double-clicks
  // This improves performance by preventing rapid state updates
  const handleCellClick = useThrottle(handleCellClickBase, 300);
  
  // Use the CPU move hook to handle AI turns
  const { isCPUThinking } = useCPUMove(gameState, handleCPUMove);
  
  // Sync the CPU thinking state with our local state
  useEffect(() => {
    setLocalIsCPUThinking(isCPUThinking);
    
    // Announce CPU thinking state to screen readers
    if (isCPUThinking) {
      announceToScreenReader("CPU is thinking about its move", "polite");
    }
  }, [isCPUThinking]);
  
  // Clear error message after a delay
  useEffect(() => {
    if (errorMessage && !hasStateError) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage, hasStateError]);
  
  // Handle game phase transitions
  useEffect(() => {
    // When transitioning to playing phase, show brief loading state
    if (gameState.gamePhase === GamePhase.PLAYING) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gamePhase]);
  
  // Handle game reset
  const handleResetGame = useCallback(() => {
    try {
      dispatch({ type: 'RESET_GAME' });
      setHasStateError(false);
      setErrorMessage(null);
    } catch (error) {
      handleError(error as Error);
    }
  }, [dispatch, handleError]);
  
  // Handle new game
  const handleNewGame = useCallback(() => {
    try {
      dispatch({ type: 'NEW_GAME' });
      setHasStateError(false);
      setErrorMessage(null);
    } catch (error) {
      handleError(error as Error);
    }
  }, [dispatch, handleError]);
  
  // Determine if we should show the setup screen
  const showSetup = gameState.gamePhase === GamePhase.SETUP;
  
  // Determine if we should show the game board
  const showGameBoard = gameState.gamePhase === GamePhase.PLAYING || gameState.gamePhase === GamePhase.FINISHED;
  
  // References for focus management
  const mainContentRef = useRef<HTMLDivElement>(null);
  const gameGridRef = useRef<HTMLDivElement>(null);
  
  // Handle keyboard navigation to skip to main content
  const skipToContent = useCallback(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      announceToScreenReader('Skipped to main content');
    }
  }, []);
  
  // Handle keyboard navigation to skip to game grid
  const skipToGameGrid = useCallback(() => {
    if (gameGridRef.current) {
      gameGridRef.current.focus();
      announceToScreenReader('Skipped to game grid');
    }
  }, []);

  return (
    <div className="App">
      {/* Skip links for keyboard navigation */}
      <a href="#main" className="skip-link" onClick={(e) => {
        e.preventDefault();
        skipToContent();
      }}>
        Skip to main content
      </a>
      
      {showGameBoard && (
        <a href="#game-grid" className="skip-link" onClick={(e) => {
          e.preventDefault();
          skipToGameGrid();
        }}>
          Skip to game grid
        </a>
      )}
      
      <header className="App-header" role="banner">
        <div className="App-logo-container">
          <img src={require('./assets/images/logo.svg').default} alt="Tic Tac Toe Ten Logo" className="App-logo" />
          <div className="App-title-container">
            <h1>Tic Tac Toe Ten</h1>
            <p>A strategic game on the Smart Grid platform</p>
          </div>
        </div>
      </header>
      
      <main id="main" className="App-main" ref={mainContentRef} tabIndex={-1}>
        {/* Game status information */}
        <GameStatus />
        
        {/* Error message display */}
        {errorMessage && (
          <div className="App-error-message" role="alert" aria-live="assertive">
            {errorMessage}
            {hasStateError && (
              <div className="App-error-actions">
                <button onClick={handleResetGame}>Reset Game</button>
                <button onClick={handleNewGame}>New Game</button>
              </div>
            )}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="App-loading" aria-live="polite">
            <div className="App-loading-spinner" aria-hidden="true"></div>
            <span>Loading game...</span>
          </div>
        )}
        
        {/* Setup screen */}
        {showSetup && !isLoading && (
          <div className="App-setup" role="region" aria-label="Game setup options">
            <div className="App-setup-options">
              <GameModeSelector />
              <PlayerModeSelector />
            </div>
            <GameControls />
          </div>
        )}
        
        {/* Game board */}
        {showGameBoard && !isLoading && !hasStateError && (
          <div id="game-grid" className="App-game" ref={gameGridRef} tabIndex={-1}>
            {/* CPU thinking indicator */}
            <CPUThinking isThinking={isCPUThinking} />
            
            {/* Master grid */}
            <MasterGrid 
              cells={gameState.cells}
              constrainedGrid={gameState.constrainedGrid}
              smallGridWinners={gameState.smallGridWinners}
              winningCells={gameState.winningCells}
              onCellClick={handleCellClick}
            />
            
            {/* Business Baby Commentators - moved after MasterGrid to ensure proper layering */}
            <BusinessBabies isCPUThinking={isCPUThinking} />
            
            {/* Game controls */}
            <GameControls />
          </div>
        )}
        
        {/* Error state fallback */}
        {hasStateError && showGameBoard && !isLoading && (
          <div className="App-error-state" role="alert">
            <h2>Game State Error</h2>
            <p>An error has occurred with the game state.</p>
            <div className="App-error-actions">
              <button onClick={handleResetGame}>Reset Game</button>
              <button onClick={handleNewGame}>New Game</button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="App-footer" role="contentinfo">
        <p>Tic Tac Toe Ten - A strategic Smart Grid game</p>
      </footer>
    </div>
  );
});

export default App;
