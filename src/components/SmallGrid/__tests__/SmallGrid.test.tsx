import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SmallGrid from '../SmallGrid';
import { Player } from '../../../types';

describe('SmallGrid Component', () => {
  const mockOnCellClick = jest.fn();
  const emptyCells = Array(9).fill(null);
  
  beforeEach(() => {
    mockOnCellClick.mockClear();
  });

  test('renders a 3x3 grid of cells', () => {
    render(
      <SmallGrid 
        gridIndex={0}
        cells={emptyCells}
        isConstrained={false}
        winner={null}
        winningCells={[]}
        onCellClick={mockOnCellClick}
      />
    );
    
    // Should have 9 cells
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  test('applies constrained style when isConstrained is true', () => {
    render(
      <SmallGrid 
        gridIndex={1}
        cells={emptyCells}
        isConstrained={true}
        winner={null}
        winningCells={[]}
        onCellClick={mockOnCellClick}
      />
    );
    
    const gridElement = screen.getByTestId('small-grid-1');
    expect(gridElement).toHaveClass('small-grid-constrained');
  });

  test('displays winner overlay when there is a winner', () => {
    render(
      <SmallGrid 
        gridIndex={2}
        cells={emptyCells}
        isConstrained={false}
        winner={Player.X}
        winningCells={[]}
        onCellClick={mockOnCellClick}
      />
    );
    
    expect(screen.getByText('X')).toBeInTheDocument();
    const gridElement = screen.getByTestId('small-grid-2');
    expect(gridElement).toHaveClass('small-grid-won');
    expect(gridElement).toHaveClass('small-grid-won-x');
  });

  test('highlights winning cells', () => {
    // Create a grid with winning cells at global indices 18, 19, 20
    // For gridIndex 2, these correspond to cellIndices 0, 1, 2
    render(
      <SmallGrid 
        gridIndex={2}
        cells={emptyCells}
        isConstrained={false}
        winner={Player.O}
        winningCells={[18, 19, 20]} // Global indices for cells in grid 2
        onCellClick={mockOnCellClick}
      />
    );
    
    // Check that cells with indices 0, 1, 2 have winning class
    const cells = screen.getAllByRole('button');
    expect(cells[0]).toHaveClass('cell-winning');
    expect(cells[1]).toHaveClass('cell-winning');
    expect(cells[2]).toHaveClass('cell-winning');
    expect(cells[3]).not.toHaveClass('cell-winning');
  });

  test('calls onCellClick with correct global index when cell is clicked', () => {
    render(
      <SmallGrid 
        gridIndex={1}
        cells={emptyCells}
        isConstrained={true}
        winner={null}
        winningCells={[]}
        onCellClick={mockOnCellClick}
      />
    );
    
    // Click the first cell (cellIndex 0) in grid 1
    // Global index should be 9 (gridIndex 1 * 9 + cellIndex 0)
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    
    expect(mockOnCellClick).toHaveBeenCalledWith(9);
  });

  test('marks cells as next target when specified', () => {
    render(
      <SmallGrid 
        gridIndex={0}
        cells={emptyCells}
        isConstrained={false}
        winner={null}
        winningCells={[]}
        onCellClick={mockOnCellClick}
        nextTargetCells={[0, 4]} // Global indices 0 and 4 are next targets
      />
    );
    
    const cells = screen.getAllByRole('button');
    expect(cells[0]).toHaveClass('cell-next-target'); // Cell 0 should be marked
    expect(cells[4]).toHaveClass('cell-next-target'); // Cell 4 should be marked
    expect(cells[1]).not.toHaveClass('cell-next-target'); // Cell 1 should not be marked
  });

  test('has correct accessibility attributes', () => {
    render(
      <SmallGrid 
        gridIndex={3}
        cells={emptyCells}
        isConstrained={true}
        winner={null}
        winningCells={[]}
        onCellClick={mockOnCellClick}
      />
    );
    
    const gridElement = screen.getByTestId('small-grid-3');
    expect(gridElement).toHaveAttribute('aria-label', 'Grid 4, active');
  });

  test('has correct accessibility attributes when won', () => {
    render(
      <SmallGrid 
        gridIndex={3}
        cells={emptyCells}
        isConstrained={false}
        winner={Player.O}
        winningCells={[]}
        onCellClick={mockOnCellClick}
      />
    );
    
    const gridElement = screen.getByTestId('small-grid-3');
    expect(gridElement).toHaveAttribute('aria-label', 'Grid 4 won by O');
  });
});