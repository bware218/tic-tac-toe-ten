import { debounce, throttle, shallowEqual, arraysEqual } from '../performanceUtils';

describe('Performance Utilities', () => {
  // Setup for timing tests
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('debounce', () => {
    it('should only execute the function once after the specified delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      // Call the debounced function multiple times
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Function should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time by 500ms
      jest.advanceTimersByTime(500);

      // Function should have been called exactly once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset the timer when called again before delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      // Call the debounced function
      debouncedFn();

      // Fast-forward time by 300ms (less than the delay)
      jest.advanceTimersByTime(300);

      // Call the debounced function again
      debouncedFn();

      // Fast-forward time by 300ms more (total 600ms, but timer was reset)
      jest.advanceTimersByTime(300);

      // Function should have been called exactly once
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Fast-forward time by 200ms more to complete the second delay
      jest.advanceTimersByTime(200);

      // Function should still have been called exactly once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should execute the function immediately and then only after the specified delay', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 500);

      // Call the throttled function
      throttledFn();

      // Function should have been called immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Call the throttled function again immediately
      throttledFn();
      throttledFn();

      // Function should still have been called only once
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Fast-forward time by 500ms
      jest.advanceTimersByTime(500);

      // Call the throttled function again
      throttledFn();

      // Function should have been called again
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('shallowEqual', () => {
    it('should return true for identical objects', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for objects with different values', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 4 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different keys', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, d: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different number of keys', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return true for same reference', () => {
      const obj = { a: 1, b: 2 };
      expect(shallowEqual(obj, obj)).toBe(true);
    });
  });

  describe('arraysEqual', () => {
    it('should return true for identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(arraysEqual(arr1, arr2)).toBe(true);
    });

    it('should return false for arrays with different values', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(arraysEqual(arr1, arr2)).toBe(false);
    });

    it('should return false for arrays with different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(arraysEqual(arr1, arr2)).toBe(false);
    });

    it('should return true for same reference', () => {
      const arr = [1, 2, 3];
      expect(arraysEqual(arr, arr)).toBe(true);
    });

    it('should handle nested arrays', () => {
      const arr1 = [1, [2, 3], 4];
      const arr2 = [1, [2, 3], 4];
      const arr3 = [1, [2, 4], 4];
      expect(arraysEqual(arr1, arr2)).toBe(true);
      expect(arraysEqual(arr1, arr3)).toBe(false);
    });

    it('should handle arrays with objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      const arr3 = [{ a: 1 }, { b: 3 }];
      expect(arraysEqual(arr1, arr2)).toBe(true);
      expect(arraysEqual(arr1, arr3)).toBe(false);
    });
  });
});