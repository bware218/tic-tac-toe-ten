import { KeyboardEvent } from 'react';

/**
 * Keyboard navigation utility for grid-based components
 * Provides functions for handling arrow key navigation within grids
 */

/**
 * Handles arrow key navigation within a grid
 * @param event - Keyboard event
 * @param currentIndex - Current focused index
 * @param rowSize - Number of elements in a row
 * @param totalItems - Total number of items in the grid
 * @param callback - Function to call with new index when navigation occurs
 * @returns boolean - Whether navigation was handled
 */
export const handleGridKeyNavigation = (
  event: KeyboardEvent,
  currentIndex: number,
  rowSize: number,
  totalItems: number,
  callback: (newIndex: number) => void
): boolean => {
  // Calculate current row and column
  const currentRow = Math.floor(currentIndex / rowSize);
  const currentCol = currentIndex % rowSize;
  
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowUp':
      // Move up one row, wrap to bottom if at top
      newIndex = currentRow > 0 
        ? currentIndex - rowSize 
        : currentIndex + (rowSize * (Math.ceil(totalItems / rowSize) - 1));
      
      // Ensure we don't go past the total items
      if (newIndex >= totalItems) {
        newIndex = newIndex - rowSize;
      }
      break;
      
    case 'ArrowDown':
      // Move down one row, wrap to top if at bottom
      newIndex = currentIndex + rowSize;
      if (newIndex >= totalItems) {
        newIndex = currentCol;
      }
      break;
      
    case 'ArrowLeft':
      // Move left one column, wrap to end of previous row if at start
      if (currentCol > 0) {
        newIndex = currentIndex - 1;
      } else {
        // Wrap to end of previous row, or to end of last row if at first row
        const previousRow = currentRow > 0 ? currentRow - 1 : Math.ceil(totalItems / rowSize) - 1;
        newIndex = (previousRow * rowSize) + (rowSize - 1);
        
        // Ensure we don't go past the total items
        if (newIndex >= totalItems) {
          newIndex = totalItems - 1;
        }
      }
      break;
      
    case 'ArrowRight':
      // Move right one column, wrap to start of next row if at end
      if (currentCol < rowSize - 1 && currentIndex < totalItems - 1) {
        newIndex = currentIndex + 1;
      } else {
        // Wrap to start of next row, or to start of first row if at last row
        newIndex = (currentRow + 1) * rowSize;
        if (newIndex >= totalItems) {
          newIndex = 0;
        }
      }
      break;
      
    default:
      return false; // Not handled
  }
  
  // If index changed, call callback and prevent default
  if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalItems) {
    event.preventDefault();
    callback(newIndex);
    return true;
  }
  
  return false;
};

/**
 * Creates a focus trap that keeps focus within a set of elements
 * @param containerRef - Reference to container element
 * @param selector - CSS selector for focusable elements
 * @returns Functions to manage focus trap
 */
export const createFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  selector: string = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
) => {
  // Get all focusable elements in the container
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
  };
  
  // Focus first element
  const focusFirst = (): void => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  };
  
  // Focus last element
  const focusLast = (): void => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  };
  
  // Handle tab key to trap focus
  const handleTabKey = (event: KeyboardEvent): void => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;
    
    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];
    
    // Shift+Tab on first element should go to last element
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab on last element should go to first element
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
  
  return {
    getFocusableElements,
    focusFirst,
    focusLast,
    handleTabKey
  };
};

/**
 * Finds the next focusable element in a specific direction
 * @param currentElement - Current focused element
 * @param direction - Direction to move ('up', 'down', 'left', 'right')
 * @returns Next focusable element or null if none found
 */
export const findNextFocusableElement = (
  currentElement: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right'
): HTMLElement | null => {
  if (!currentElement) return null;
  
  // Get element position and dimensions
  const rect = currentElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Get all focusable elements
  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el !== currentElement);
  
  // Calculate distances and find closest element in the specified direction
  let closestElement: HTMLElement | null = null;
  let closestDistance = Infinity;
  
  for (const element of focusableElements) {
    const elementRect = element.getBoundingClientRect();
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;
    
    // Calculate horizontal and vertical distances
    const horizontalDistance = elementCenterX - centerX;
    const verticalDistance = elementCenterY - centerY;
    
    // Check if element is in the specified direction
    let isInDirection = false;
    switch (direction) {
      case 'up':
        isInDirection = verticalDistance < 0 && Math.abs(horizontalDistance) < Math.abs(verticalDistance) * 2;
        break;
      case 'down':
        isInDirection = verticalDistance > 0 && Math.abs(horizontalDistance) < Math.abs(verticalDistance) * 2;
        break;
      case 'left':
        isInDirection = horizontalDistance < 0 && Math.abs(verticalDistance) < Math.abs(horizontalDistance) * 2;
        break;
      case 'right':
        isInDirection = horizontalDistance > 0 && Math.abs(verticalDistance) < Math.abs(horizontalDistance) * 2;
        break;
    }
    
    if (isInDirection) {
      // Calculate Euclidean distance
      const distance = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = element;
      }
    }
  }
  
  return closestElement;
};

/**
 * Announces a message to screen readers using aria-live region
 * @param message - Message to announce
 * @param priority - Announcement priority ('polite' or 'assertive')
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  // Find or create announcement element
  let announcer = document.getElementById('screen-reader-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  // Set the announcement text
  announcer.textContent = '';
  
  // Force browser to recognize the change
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 50);
};