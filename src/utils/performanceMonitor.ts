/**
 * Performance monitoring utilities to detect and handle performance issues
 */

import { isMobileDevice } from './browserCompatibility';

// Constants for performance thresholds
const FPS_THRESHOLD = 30; // Consider performance issues if FPS drops below this
const FRAME_TIME_THRESHOLD = 50; // Consider performance issues if frame time exceeds this (in ms)
const SAMPLE_SIZE = 10; // Number of frames to sample for performance measurement

// Performance state
let isHighPerformanceMode = false;
let frameCount = 0;
let lastFrameTime = 0;
let frameTimes: number[] = [];
let isMonitoring = false;

/**
 * Start monitoring performance
 */
export function startPerformanceMonitoring(): void {
  // Skip monitoring on server-side rendering
  if (typeof window === 'undefined') return;
  
  // Already monitoring
  if (isMonitoring) return;
  
  // Set initial state
  isMonitoring = true;
  frameCount = 0;
  lastFrameTime = performance.now();
  frameTimes = [];
  
  // Enable high performance mode by default on mobile devices
  if (isMobileDevice()) {
    enableHighPerformanceMode();
  }
  
  // Start monitoring frame rate
  requestAnimationFrame(monitorFrameRate);
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring(): void {
  isMonitoring = false;
}

/**
 * Monitor frame rate to detect performance issues
 */
function monitorFrameRate(timestamp: number): void {
  if (!isMonitoring) return;
  
  // Calculate frame time
  const frameTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  
  // Add to sample
  frameTimes.push(frameTime);
  if (frameTimes.length > SAMPLE_SIZE) {
    frameTimes.shift();
  }
  
  // Check performance after collecting enough samples
  if (frameTimes.length === SAMPLE_SIZE) {
    checkPerformance();
  }
  
  // Continue monitoring
  frameCount++;
  requestAnimationFrame(monitorFrameRate);
}

/**
 * Check performance metrics and enable high performance mode if needed
 */
function checkPerformance(): void {
  // Calculate average frame time
  const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
  
  // Calculate FPS
  const fps = 1000 / avgFrameTime;
  
  // Check if performance is below threshold
  if (fps < FPS_THRESHOLD || avgFrameTime > FRAME_TIME_THRESHOLD) {
    enableHighPerformanceMode();
  }
}

/**
 * Enable high performance mode
 */
export function enableHighPerformanceMode(): void {
  if (isHighPerformanceMode) return;
  
  // Add class to body
  document.body.classList.add('high-performance-mode');
  
  // Disable non-essential animations
  disableNonEssentialAnimations();
  
  // Log performance mode change
  console.log('High performance mode enabled due to performance constraints');
  
  isHighPerformanceMode = true;
}

/**
 * Disable high performance mode
 */
export function disableHighPerformanceMode(): void {
  if (!isHighPerformanceMode) return;
  
  // Remove class from body
  document.body.classList.remove('high-performance-mode');
  
  // Re-enable animations
  enableAllAnimations();
  
  // Log performance mode change
  console.log('High performance mode disabled');
  
  isHighPerformanceMode = false;
}

/**
 * Disable non-essential animations to improve performance
 */
function disableNonEssentialAnimations(): void {
  // Reduce animation complexity
  document.querySelectorAll('.animate-win').forEach((el) => {
    (el as HTMLElement).style.animationDuration = '2s';
  });
  
  // Simplify transitions
  document.querySelectorAll('[style*="transition"]').forEach((el) => {
    const currentStyle = (el as HTMLElement).style.transition;
    if (currentStyle && currentStyle.length > 0) {
      (el as HTMLElement).dataset.originalTransition = currentStyle;
      (el as HTMLElement).style.transition = 'opacity 0.2s';
    }
  });
}

/**
 * Re-enable all animations
 */
function enableAllAnimations(): void {
  // Restore animation durations
  document.querySelectorAll('.animate-win').forEach((el) => {
    (el as HTMLElement).style.animationDuration = '';
  });
  
  // Restore transitions
  document.querySelectorAll('[data-original-transition]').forEach((el) => {
    const originalTransition = (el as HTMLElement).dataset.originalTransition;
    if (originalTransition) {
      (el as HTMLElement).style.transition = originalTransition;
      delete (el as HTMLElement).dataset.originalTransition;
    }
  });
}

/**
 * Check if high performance mode is enabled
 * @returns True if high performance mode is enabled, false otherwise
 */
export function isHighPerformanceModeEnabled(): boolean {
  return isHighPerformanceMode;
}

/**
 * Get current performance metrics
 * @returns Object containing current performance metrics
 */
export function getPerformanceMetrics(): { fps: number; frameTime: number } {
  if (frameTimes.length === 0) {
    return { fps: 60, frameTime: 16.67 }; // Default values
  }
  
  const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
  const fps = 1000 / avgFrameTime;
  
  return {
    fps,
    frameTime: avgFrameTime
  };
}