import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cell from '../Cell';
import { Player } from '../../../types';

describe('Cell Component', () => {
  const mockOnClick = jest.fn();
  
  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test('renders empty cell with correct number', () => {
    render(
      <Cell 
        cellIndex={4} 
        value={null} 
        isPlayable={true} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    expect(screen.getByText('5')).toBeInTheDocument(); // cellIndex 4 displays as number 5
  });

  test('renders cell with X value', () => {
    render(
      <Cell 
        cellIndex={0} 
        value={Player.X} 
        isPlayable={false} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // Number should not be shown when value is present
  });

  test('handles click when playable', () => {
    render(
      <Cell 
        cellIndex={2} 
        value={null} 
        isPlayable={true} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('does not handle click when not playable', () => {
    render(
      <Cell 
        cellIndex={2} 
        value={null} 
        isPlayable={false} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('applies winning style when isWinning is true', () => {
    render(
      <Cell 
        cellIndex={1} 
        value={Player.O} 
        isPlayable={false} 
        isWinning={true} 
        onClick={mockOnClick} 
      />
    );
    
    const cellElement = screen.getByRole('button');
    expect(cellElement).toHaveClass('cell-winning');
  });

  test('applies next target style when isNextTarget is true', () => {
    render(
      <Cell 
        cellIndex={1} 
        value={null} 
        isPlayable={true} 
        isWinning={false}
        isNextTarget={true}
        onClick={mockOnClick} 
      />
    );
    
    const cellElement = screen.getByRole('button');
    expect(cellElement).toHaveClass('cell-next-target');
  });

  test('handles keyboard navigation with Enter key', () => {
    render(
      <Cell 
        cellIndex={3} 
        value={null} 
        isPlayable={true} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    const cellElement = screen.getByRole('button');
    fireEvent.keyDown(cellElement, { key: 'Enter', code: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('has correct accessibility attributes', () => {
    render(
      <Cell 
        cellIndex={7} 
        value={null} 
        isPlayable={true} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    const cellElement = screen.getByRole('button');
    expect(cellElement).toHaveAttribute('aria-label', 'Cell 8, playable');
    expect(cellElement).toHaveAttribute('tabIndex', '0');
  });

  test('has correct accessibility attributes when not playable', () => {
    render(
      <Cell 
        cellIndex={7} 
        value={null} 
        isPlayable={false} 
        isWinning={false} 
        onClick={mockOnClick} 
      />
    );
    
    const cellElement = screen.getByRole('button');
    expect(cellElement).toHaveAttribute('aria-label', 'Cell 8, not playable');
    expect(cellElement).toHaveAttribute('tabIndex', '-1');
  });
});