/**
 * Performance utilities for optimizing React component rendering
 */

import { DependencyList, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook that returns a memoized callback that only changes if one of the dependencies changes.
 * This is similar to useCallback but with a deep comparison of dependencies.
 * 
 * @param callback - The callback function to memoize
 * @param dependencies - The dependencies array to watch for changes
 * @returns The memoized callback function
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: DependencyList
): T {
  // Store the callback in a ref
  const callbackRef = useRef(callback);
  
  // Store the dependencies in a ref for comparison
  const dependenciesRef = useRef(dependencies);
  
  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Check if dependencies have changed with deep comparison
  const depsChanged = dependencies.some(
    (dep, i) => dep !== dependenciesRef.current[i]
  );
  
  // Update dependencies ref if they've changed
  useEffect(() => {
    if (depsChanged) {
      dependenciesRef.current = dependencies;
    }
  }, [dependencies, depsChanged]);
  
  // Return the memoized callback
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    [depsChanged]
  );
}

/**
 * Debounces a function call
 * 
 * @param func - The function to debounce
 * @param wait - The time to wait in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Custom hook that returns a debounced version of the provided function
 * 
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay) as T,
    [delay]
  );
}

/**
 * Throttles a function call
 * 
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Custom hook that returns a throttled version of the provided function
 * 
 * @param callback - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled version of the function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit) as T,
    [limit]
  );
}

/**
 * Performs a shallow comparison of two objects
 * 
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @returns True if objects are shallowly equal, false otherwise
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }
  
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Performs a deep comparison of two arrays
 * 
 * @param arr1 - First array to compare
 * @param arr2 - Second array to compare
 * @returns True if arrays are deeply equal, false otherwise
 */
export function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1 === arr2) {
    return true;
  }
  
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }
  
  if (arr1.length !== arr2.length) {
    return false;
  }
  
  return arr1.every((item, index) => {
    if (Array.isArray(item) && Array.isArray(arr2[index])) {
      return arraysEqual(item, arr2[index]);
    }
    
    if (typeof item === 'object' && item !== null && 
        typeof arr2[index] === 'object' && arr2[index] !== null) {
      return shallowEqual(item, arr2[index]);
    }
    
    return item === arr2[index];
  });
}