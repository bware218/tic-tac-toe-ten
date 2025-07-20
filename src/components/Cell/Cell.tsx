import React, { useState, useRef, useEffect } from 'react';
import { CellValue } from '../../types';
import { cellIndexToDisplayNumber } from '../../utils/gridUtils';
import { announceToScreenReader } from '../../utils/keyboardNavigation';
import './Cell.css';

interface CellProps {
  cellIndex: number;      // Index within small grid (0-8)
  globalIndex?: number;   // Optional global index (0-80) for additional context
  value: CellValue;       // X, O, or null
  isPlayable: boolean;    // Whether cell can be clicked
  isWinning: boolean;     // Whether cell is part of winning combination
  isNextTarget?: boolean; // Whether this cell would send opponent to a full/won grid
  onClick: () => void;    // Click handler
  onKeyNavigation?: (direction: 'up' | 'down' | 'left' | 'right', globalIndex: number) => void; // Keyboard navigation handler
  isFocused?: boolean;    // Whether this cell should be focused
}

const Cell: React.FC<CellProps> = ({ 
  cellIndex, 
  globalIndex = -1,
  value, 
  isPlayable, 
  isWinning,
  isNextTarget = false,
  onClick,
  onKeyNavigation,
  isFocused = false
}) => {
  // Local state for hover effect
  const [isHovered, setIsHovered] = useState(false);
  
  // Reference to the cell element for focus management
  const cellRef = useRef<HTMLDivElement>(null);
  
  // Display number (1-9) for the cell
  const displayNumber = cellIndexToDisplayNumber(cellIndex);
  
  // Determine CSS classes based on props
  const cellClasses = [
    'cell',
    value ? `cell-${value.toLowerCase()}` : '',
    isPlayable ? 'cell-playable' : 'cell-disabled',
    isWinning ? 'cell-winning' : '',
    isHovered && isPlayable ? 'cell-hovered' : '',
    isNextTarget ? 'cell-next-target' : '',
    isFocused ? 'cell-focused' : ''
  ].filter(Boolean).join(' ');
  
  // Handle mouse events for hover state
  const handleMouseEnter = () => {
    if (isPlayable) {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  // Handle click with feedback
  const handleClick = () => {
    if (isPlayable) {
      onClick();
      
      // Announce the move to screen readers
      const announcement = `Cell ${displayNumber} selected`;
      announceToScreenReader(announcement);
    }
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isPlayable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
      
      // Announce the move to screen readers
      const announcement = `Cell ${displayNumber} selected`;
      announceToScreenReader(announcement);
      return;
    }
    
    // Handle arrow key navigation
    if (onKeyNavigation && globalIndex !== -1) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onKeyNavigation('up', globalIndex);
          break;
        case 'ArrowDown':
          e.preventDefault();
          onKeyNavigation('down', globalIndex);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onKeyNavigation('left', globalIndex);
          break;
        case 'ArrowRight':
          e.preventDefault();
          onKeyNavigation('right', globalIndex);
          break;
      }
    }
  };
  
  // Focus the cell when isFocused prop changes
  useEffect(() => {
    if (isFocused && isPlayable && cellRef.current) {
      cellRef.current.focus();
      
      // Announce the focused cell to screen readers
      const announcement = value 
        ? `Cell ${displayNumber} with ${value}${isPlayable ? ', playable' : ''}`
        : `Cell ${displayNumber}${isPlayable ? ', playable' : ''}`;
      
      announceToScreenReader(announcement, 'polite');
    }
  }, [isFocused, isPlayable, displayNumber, value]);
  
  return (
    <div 
      ref={cellRef}
      className={cellClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`cell-${cellIndex}`}
      data-global-index={globalIndex}
      aria-label={value 
        ? `Cell ${displayNumber} with ${value}${isPlayable ? ', playable' : ', not playable'}` 
        : `Cell ${displayNumber}${isPlayable ? ', playable' : ', not playable'}`
      }
      role="button"
      tabIndex={isPlayable ? 0 : -1}
      onKeyDown={handleKeyDown}
      aria-pressed={value !== null}
    >
      {value ? (
        <span className="cell-value animate-cell-placement" aria-hidden="true">{value}</span>
      ) : (
        <>
          <span className="cell-number" aria-hidden="true">{displayNumber}</span>
          {isPlayable && isHovered && (
            <span className="cell-hover-indicator" aria-hidden="true" />
          )}
        </>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
// Only re-render when props change
export default React.memo(Cell, (prevProps, nextProps) => {
  // Custom comparison function to determine if re-render is needed
  return (
    prevProps.value === nextProps.value &&
    prevProps.isPlayable === nextProps.isPlayable &&
    prevProps.isWinning === nextProps.isWinning &&
    prevProps.isNextTarget === nextProps.isNextTarget &&
    prevProps.isFocused === nextProps.isFocused
  );
});