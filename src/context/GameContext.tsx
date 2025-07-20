import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Player, GameMode, PlayerMode, GamePhase, CPUDifficulty } from '../types';
import { gameReducer, createInitialGameState } from './gameReducer';

interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, createInitialGameState());

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};