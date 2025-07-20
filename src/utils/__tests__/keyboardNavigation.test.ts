import { handleGridKeyNavigation, findNextFocusableElement, createFocusTrap } from '../keyboardNavigation';

describe('Keyboard Navigation Utilities', () => {
  // Test handleGridKeyNavigation
  describe('handleGridKeyNavigation', () => {
    it('should handle arrow key navigation within a grid', () => {
      const mockCallback = jest.fn();
      const event = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent;
      
      // Test moving right from index 0 to 1
      const handled = handleGridKeyNavigation(
        event,
        0, // current index
        3, // row size
        9, // total items
        mockCallback
      );
      
      expect(handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(1);
    });
    
    it('should wrap around when navigating past grid boundaries', () => {
      const mockCallback = jest.fn();
      const event = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent;
      
      // Test moving right from index 2 (end of row) to 3 (start of next row)
      const handled = handleGridKeyNavigation(
        event,
        2, // current index
        3, // row size
        9, // total items
        mockCallback
      );
      
      expect(handled).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(3);
    });
    
    it('should wrap from bottom to top when navigating down from last row', () => {
      const mockCallback = jest.fn();
      const event = {
        key: 'ArrowDown',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent;
      
      // Test moving down from index 7 (in last row) to 1 (in first row)
      const handled = handleGridKeyNavigation(
        event,
        7, // current index
        3, // row size
        9, // total items
        mockCallback
      );
      
      expect(handled).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith(1);
    });
    
    it('should not handle non-arrow keys', () => {
      const mockCallback = jest.fn();
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent;
      
      const handled = handleGridKeyNavigation(
        event,
        0, // current index
        3, // row size
        9, // total items
        mockCallback
      );
      
      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
  
  // Test createFocusTrap
  describe('createFocusTrap', () => {
    beforeEach(() => {
      // Set up DOM elements for testing
      document.body.innerHTML = `
        <div id="container">
          <button id="first">First</button>
          <button id="middle">Middle</button>
          <button id="last">Last</button>
          <div tabindex="-1">Not focusable</div>
        </div>
      `;
    });
    
    it('should get all focusable elements in container', () => {
      const containerRef = {
        current: document.getElementById('container')
      } as React.RefObject<HTMLElement>;
      
      const { getFocusableElements } = createFocusTrap(containerRef);
      const elements = getFocusableElements();
      
      expect(elements.length).toBe(3);
      expect(elements[0].id).toBe('first');
      expect(elements[1].id).toBe('middle');
      expect(elements[2].id).toBe('last');
    });
    
    it('should focus the first element', () => {
      const containerRef = {
        current: document.getElementById('container')
      } as React.RefObject<HTMLElement>;
      
      const { focusFirst } = createFocusTrap(containerRef);
      const firstElement = document.getElementById('first');
      
      // Mock focus method
      firstElement!.focus = jest.fn();
      
      focusFirst();
      expect(firstElement!.focus).toHaveBeenCalled();
    });
    
    it('should focus the last element', () => {
      const containerRef = {
        current: document.getElementById('container')
      } as React.RefObject<HTMLElement>;
      
      const { focusLast } = createFocusTrap(containerRef);
      const lastElement = document.getElementById('last');
      
      // Mock focus method
      lastElement!.focus = jest.fn();
      
      focusLast();
      expect(lastElement!.focus).toHaveBeenCalled();
    });
  });
});