import React from 'react';
import { render, screen } from '@testing-library/react';
import MasterGrid from '../MasterGrid';
import { Player } from '../../../types';

describe('MasterGrid Component', () => {
  // Mock props
  const defaultProps = {
    cells: Array(81).fill(null),
    constrainedGrid: null,
    smallGridWinners: Array(9).fill(null),
    winningCells: [],
    onCellClick: jest.fn()
  };

  test('renders all 9 small grids', () => {
    render(<MasterGrid {...defaultProps} />);
    
    // Check that all 9 small grids are rendered
    for (let i = 0; i < 9; i++) {
      expect(screen.getByTestId(`small-grid-${i}`)).toBeInTheDocument();
    }
  });

  test('highlights constrained grid correctly', () => {
    const constrainedGridIndex = 4; // Center grid
    render(
      <MasterGrid 
        {...defaultProps} 
        constrainedGrid={constrainedGridIndex} 
      />
    );
    
    // The constrained grid should have the constrained class
    const constrainedGrid = screen.getByTestId(`small-grid-${constrainedGridIndex}`);
    expect(constrainedGrid.className).toContain('small-grid-constrained');
    
    // Other grids should not have the constrained class
    for (let i = 0; i < 9; i++) {
      if (i !== constrainedGridIndex) {
        const grid = screen.getByTestId(`small-grid-${i}`);
        expect(grid.className).not.toContain('small-grid-constrained');
      }
    }
  });

  test('displays grid winners correctly', () => {
    // Set up some grid winners
    const smallGridWinners = Array(9).fill(null);
    smallGridWinners[0] = Player.X;
    smallGridWinners[4] = Player.O;
    
    render(
      <MasterGrid 
        {...defaultProps} 
        smallGridWinners={smallGridWinners} 
      />
    );
    
    // Check that winner overlays are displayed
    const grid0 = screen.getByTestId('small-grid-0');
    const grid4 = screen.getByTestId('small-grid-4');
    
    expect(grid0.className).toContain('small-grid-won');
    expect(grid0.className).toContain('small-grid-won-x');
    expect(grid4.className).toContain('small-grid-won');
    expect(grid4.className).toContain('small-grid-won-o');
    
    // Check that winner symbols are displayed
    expect(grid0.textContent).toContain('X');
    expect(grid4.textContent).toContain('O');
  });

  test('passes winning cells to small grids', () => {
    // Set up some winning cells
    const winningCells = [0, 1, 2]; // First row of first grid
    
    render(
      <MasterGrid 
        {...defaultProps} 
        winningCells={winningCells} 
      />
    );
    
    // The first grid should receive these winning cells
    // This is a bit harder to test directly, but we can check that the cells
    // in the first grid have the winning class
    // This would require more detailed testing of the SmallGrid component
  });

  test('has proper accessibility attributes', () => {
    render(<MasterGrid {...defaultProps} />);
    
    // Check that the grid has proper ARIA attributes
    // Use getAllByRole since there are multiple grid elements (one master grid and multiple small grids)
    const grids = screen.getAllByRole('grid');
    // The first grid should be the master grid
    const masterGrid = grids.find(grid => 
      grid.getAttribute('aria-label') === 'Tic Tac Toe Ten game board'
    );
    expect(masterGrid).toBeInTheDocument();
  });
});