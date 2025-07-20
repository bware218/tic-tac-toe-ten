import React, { useState } from 'react';
import { CellValue, Player } from '../../types';
import Cell from '../Cell/Cell';
import { gridCellToGlobal } from '../../utils/gridUtils';
import './SmallGrid.css';

interface SmallGridProps {
  gridIndex: number;       // Position in master grid (0-8)
  cells: CellValue[];      // Array of 9 cell values for this grid
  isConstrained: boolean;  // Whether this grid is the only playable area
  winner: Player | null;   // Player who won this grid ('X', 'O', or null)
  winningCells: number[];  // Global indices of winning cells
  onCellClick: (globalIndex: number) => void; // Cell click handler
  nextTargetCells?: number[]; // Optional array of cells that would send opponent to a full/won grid
  onGridNavigation?: (direction: 'up' | 'down' | 'left' | 'right', fromGridIndex: number) => void; // Grid navigation handler
  focusedCellIndex?: number; // Global index of the currently focused cell
  constrainedGrid: number | null; // The currently constrained grid (null means free choice)
}

const SmallGrid: React.FC<SmallGridProps> = ({
  gridIndex,
  cells,
  isConstrained,
  winner,
  winningCells,
  onCellClick,
  nextTargetCells = [],
  onGridNavigation,
  focusedCellIndex,
  constrainedGrid
}) => {
  // Track which cell is focused within this grid for keyboard navigation
  const [localFocusedCellIndex, setLocalFocusedCellIndex] = useState<number | null>(null);
  
  // Determine CSS classes based on props
  const gridClasses = [
    'small-grid',
    isConstrained ? 'small-grid-constrained' : '',
    winner ? `small-grid-won small-grid-won-${winner.toLowerCase()}` : ''
  ].filter(Boolean).join(' ');

  // Handle keyboard navigation between cells within this grid
  const handleCellKeyNavigation = (direction: 'up' | 'down' | 'left' | 'right', globalIndex: number) => {
    // Calculate the local cell index (0-8) from the global index
    const localCellIndex = globalIndex % 9;
    
    // Calculate row and column (0-2) within this small grid
    const row = Math.floor(localCellIndex / 3);
    const col = localCellIndex % 3;
    
    let newRow = row;
    let newCol = col;
    let shouldNavigateToNextGrid = false;
    
    // Calculate new position based on direction
    switch (direction) {
      case 'up':
        newRow = row - 1;
        if (newRow < 0) {
          // Navigate to the grid above
          shouldNavigateToNextGrid = true;
        }
        break;
      case 'down':
        newRow = row + 1;
        if (newRow > 2) {
          // Navigate to the grid below
          shouldNavigateToNextGrid = true;
        }
        break;
      case 'left':
        newCol = col - 1;
        if (newCol < 0) {
          // Navigate to the grid to the left
          shouldNavigateToNextGrid = true;
        }
        break;
      case 'right':
        newCol = col + 1;
        if (newCol > 2) {
          // Navigate to the grid to the right
          shouldNavigateToNextGrid = true;
        }
        break;
    }
    
    if (shouldNavigateToNextGrid && onGridNavigation) {
      // Navigate to adjacent grid
      onGridNavigation(direction, gridIndex);
    } else if (!shouldNavigateToNextGrid) {
      // Calculate new local cell index
      const newLocalCellIndex = (newRow * 3) + newCol;
      
      // Calculate new global cell index
      const newGlobalIndex = gridCellToGlobal(gridIndex, newLocalCellIndex);
      
      // Update local focus state
      setLocalFocusedCellIndex(newGlobalIndex);
    }
  };

  // Render the 3x3 grid of cells
  return (
    <div 
      className={gridClasses}
      data-testid={`small-grid-${gridIndex}`}
      data-grid-index={gridIndex}
      role="group"
      aria-label={winner 
        ? `Grid ${gridIndex + 1} won by ${winner}` 
        : `Grid ${gridIndex + 1}${isConstrained ? ', active' : ''}`
      }
    >
      {/* Winner overlay */}
      {winner && (
        <div className="winner-overlay" aria-hidden="true">
          <span className="winner-symbol">{winner}</span>
        </div>
      )}
      
      {/* Grid cells */}
      <div className="small-grid-cells" role="grid">
        {Array.from({ length: 9 }, (_, cellIndex) => {
          // Calculate global index for this cell
          const globalIndex = gridCellToGlobal(gridIndex, cellIndex);
          
          // Determine if this cell is part of a winning combination
          const isWinning = winningCells.includes(globalIndex);
          
          // Determine if this cell would send opponent to a full/won grid
          const isNextTarget = nextTargetCells.includes(globalIndex);
          
          // Determine if cell is playable
          // Cell is playable if it's empty AND either:
          // 1. This grid is constrained (player must play here), OR
          // 2. No grid is constrained (first move or free choice)
          const isPlayable = cells[cellIndex] === null && (isConstrained || constrainedGrid === null);
          
          // Determine if this cell is focused
          const isFocused = 
            (focusedCellIndex === globalIndex) || 
            (localFocusedCellIndex === globalIndex);
          
          return (
            <Cell
              key={cellIndex}
              cellIndex={cellIndex}
              globalIndex={globalIndex}
              value={cells[cellIndex]}
              isPlayable={isPlayable}
              isWinning={isWinning}
              isNextTarget={isNextTarget}
              onClick={() => onCellClick(globalIndex)}
              onKeyNavigation={handleCellKeyNavigation}
              isFocused={isFocused}
            />
          );
        })}
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
// Only re-render when props change
export default React.memo(SmallGrid, (prevProps, nextProps) => {
  // Custom comparison function to determine if re-render is needed
  // Deep compare cells array
  const cellsEqual = prevProps.cells.every((cell, index) => cell === nextProps.cells[index]);
  
  // Deep compare winning cells array
  const winningCellsEqual = 
    prevProps.winningCells.length === nextProps.winningCells.length &&
    prevProps.winningCells.every((cell, index) => cell === nextProps.winningCells[index]);
  
  // Deep compare next target cells array
  const nextTargetCellsEqual = 
    (prevProps.nextTargetCells?.length || 0) === (nextProps.nextTargetCells?.length || 0) &&
    (prevProps.nextTargetCells || []).every((cell, index) => 
      cell === (nextProps.nextTargetCells || [])[index]);
  
  return (
    cellsEqual &&
    winningCellsEqual &&
    nextTargetCellsEqual &&
    prevProps.isConstrained === nextProps.isConstrained &&
    prevProps.winner === nextProps.winner &&
    prevProps.focusedCellIndex === nextProps.focusedCellIndex
  );
});