import React, { useState, useEffect, useRef } from 'react';
import { CellValue, Player } from '../../types';
import SmallGrid from '../SmallGrid/SmallGrid';
import { getFullGridExceptionTriggeringCells, gridCellToGlobal } from '../../utils/gridUtils';
import { announceToScreenReader } from '../../utils/keyboardNavigation';
import './MasterGrid.css';

interface MasterGridProps {
  cells: CellValue[];                  // All 81 cell values
  constrainedGrid: number | null;      // Which small grid is currently active
  smallGridWinners: (Player | null)[]; // Winners of each small grid
  winningCells: number[];              // Global indices of winning cells
  onCellClick: (globalIndex: number) => void; // Cell click handler
}

const MasterGrid: React.FC<MasterGridProps> = ({
  cells,
  constrainedGrid,
  smallGridWinners,
  winningCells,
  onCellClick
}) => {
  // State to track the currently focused cell for keyboard navigation
  const [focusedCellIndex, setFocusedCellIndex] = useState<number | null>(null);
  
  // Reference to the master grid element for focus management
  const masterGridRef = useRef<HTMLDivElement>(null);
  
  // Calculate cells that would send opponent to a full/won grid
  const nextTargetCells = getFullGridExceptionTriggeringCells(cells, smallGridWinners);

  // Handle keyboard navigation between small grids
  const handleGridNavigation = (direction: 'up' | 'down' | 'left' | 'right', fromGridIndex: number) => {
    // Calculate row and column (0-2) of the current grid
    const gridRow = Math.floor(fromGridIndex / 3);
    const gridCol = fromGridIndex % 3;
    
    let newGridRow = gridRow;
    let newGridCol = gridCol;
    
    // Calculate new grid position based on direction
    switch (direction) {
      case 'up':
        newGridRow = (gridRow - 1 + 3) % 3; // Wrap around
        break;
      case 'down':
        newGridRow = (gridRow + 1) % 3; // Wrap around
        break;
      case 'left':
        newGridCol = (gridCol - 1 + 3) % 3; // Wrap around
        break;
      case 'right':
        newGridCol = (gridCol + 1) % 3; // Wrap around
        break;
    }
    
    // Calculate new grid index
    const newGridIndex = (newGridRow * 3) + newGridCol;
    
    // Calculate cell position within the grid (maintain same position)
    const cellPositionWithinGrid = focusedCellIndex !== null ? focusedCellIndex % 9 : 4; // Default to center cell
    
    // Calculate new global cell index
    const newGlobalCellIndex = gridCellToGlobal(newGridIndex, cellPositionWithinGrid);
    
    // Update focused cell
    setFocusedCellIndex(newGlobalCellIndex);
    
    // Announce grid change to screen readers
    announceToScreenReader(`Moved to grid ${newGridIndex + 1}`);
  };

  // Find the first playable cell when focus enters the grid
  const findFirstPlayableCell = (): number | null => {
    // If there's a constrained grid, look there first
    if (constrainedGrid !== null) {
      const startIndex = constrainedGrid * 9;
      const endIndex = startIndex + 9;
      
      for (let i = startIndex; i < endIndex; i++) {
        if (cells[i] === null) {
          return i;
        }
      }
    }
    
    // Otherwise, check all cells
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === null) {
        return i;
      }
    }
    
    return null;
  };

  // Set initial focus when the component mounts or when constraints change
  useEffect(() => {
    // Only set initial focus if no cell is currently focused
    if (focusedCellIndex === null) {
      const firstPlayableCell = findFirstPlayableCell();
      if (firstPlayableCell !== null) {
        setFocusedCellIndex(firstPlayableCell);
      }
    }
  }, [constrainedGrid, focusedCellIndex]);

  // Handle keyboard events at the master grid level
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Tab key to manage focus entering/leaving the grid
    if (e.key === 'Tab') {
      // When tabbing into the grid, focus the first playable cell
      if (document.activeElement === masterGridRef.current) {
        const firstPlayableCell = findFirstPlayableCell();
        if (firstPlayableCell !== null) {
          e.preventDefault();
          setFocusedCellIndex(firstPlayableCell);
        }
      }
    }
  };

  return (
    <div 
      ref={masterGridRef}
      className="master-grid"
      data-testid="master-grid"
      role="grid"
      aria-label="Tic Tac Toe Ten game board"
      tabIndex={0} // Make the grid focusable
      onKeyDown={handleKeyDown}
    >
      {/* Render 9 small grids in a 3x3 layout */}
      {Array.from({ length: 9 }, (_, gridIndex) => {
        // Extract the 9 cells for this small grid
        const gridCells = cells.slice(gridIndex * 9, (gridIndex + 1) * 9);
        
        // Determine if this grid is constrained (active)
        const isConstrained = constrainedGrid === gridIndex;
        
        // Get the winner of this small grid
        const winner = smallGridWinners[gridIndex];
        
        // Filter winning cells to only those in this grid
        const gridWinningCells = winningCells.filter(
          cellIndex => Math.floor(cellIndex / 9) === gridIndex
        );
        
        return (
          <div 
            key={gridIndex} 
            className="master-grid-cell"
            data-grid-index={gridIndex}
            role="rowgroup"
          >
            <SmallGrid
              gridIndex={gridIndex}
              cells={gridCells}
              isConstrained={isConstrained}
              winner={winner}
              winningCells={gridWinningCells}
              onCellClick={onCellClick}
              nextTargetCells={nextTargetCells}
              onGridNavigation={handleGridNavigation}
              focusedCellIndex={focusedCellIndex !== null ? focusedCellIndex : undefined}
              constrainedGrid={constrainedGrid}
            />
          </div>
        );
      })}
      
      {/* Hidden element for screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="grid-announcer"
      />
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(MasterGrid, (prevProps, nextProps) => {
  // Custom comparison function to determine if re-render is needed
  
  // Deep compare cells array
  const cellsEqual = prevProps.cells.every((cell, index) => cell === nextProps.cells[index]);
  
  // Deep compare small grid winners array
  const smallGridWinnersEqual = prevProps.smallGridWinners.every(
    (winner, index) => winner === nextProps.smallGridWinners[index]
  );
  
  // Deep compare winning cells array
  const winningCellsEqual = 
    prevProps.winningCells.length === nextProps.winningCells.length &&
    prevProps.winningCells.every((cell, index) => cell === nextProps.winningCells[index]);
  
  return (
    cellsEqual &&
    smallGridWinnersEqual &&
    winningCellsEqual &&
    prevProps.constrainedGrid === nextProps.constrainedGrid
  );
});