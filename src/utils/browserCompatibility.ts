/**
 * Browser compatibility utilities for detecting and handling browser-specific features
 */

/**
 * Detects the user's browser and version
 * @returns Object containing browser name and version
 */
export function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  // Detect Chrome
  if (/Chrome/.test(userAgent) && !/Chromium|Edge|Edg|OPR|Opera/.test(userAgent)) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || "Unknown";
  }
  // Detect Firefox
  else if (/Firefox/.test(userAgent)) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || "Unknown";
  }
  // Detect Safari (not Chrome)
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || "Unknown";
  }
  // Detect Edge (Chromium-based)
  else if (/Edg/.test(userAgent)) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edg\/(\d+\.\d+)/)?.[1] || "Unknown";
  }
  // Detect Opera
  else if (/OPR|Opera/.test(userAgent)) {
    browserName = "Opera";
    browserVersion = userAgent.match(/(?:OPR|Opera)\/(\d+\.\d+)/)?.[1] || "Unknown";
  }
  // Detect IE
  else if (/Trident/.test(userAgent)) {
    browserName = "Internet Explorer";
    browserVersion = userAgent.match(/rv:(\d+\.\d+)/)?.[1] || "Unknown";
  }
  
  return { name: browserName, version: browserVersion };
}

/**
 * Detects if the user is on a mobile device
 * @returns True if the user is on a mobile device, false otherwise
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detects if the user is on a touch device
 * @returns True if the user is on a touch device, false otherwise
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Detects if the browser supports CSS Grid
 * @returns True if the browser supports CSS Grid, false otherwise
 */
export function supportsGrid(): boolean {
  return window.CSS && CSS.supports && CSS.supports('display', 'grid');
}

/**
 * Detects if the browser supports CSS Flexbox
 * @returns True if the browser supports CSS Flexbox, false otherwise
 */
export function supportsFlexbox(): boolean {
  return window.CSS && CSS.supports && CSS.supports('display', 'flex');
}

/**
 * Detects if the browser supports CSS Variables
 * @returns True if the browser supports CSS Variables, false otherwise
 */
export function supportsCssVariables(): boolean {
  return window.CSS && CSS.supports && CSS.supports('--custom-prop', 'value');
}

/**
 * Detects if the browser supports the Web Animation API
 * @returns True if the browser supports the Web Animation API, false otherwise
 */
export function supportsWebAnimations(): boolean {
  return 'animate' in document.createElement('div');
}

/**
 * Detects if the browser supports passive event listeners
 * @returns True if the browser supports passive event listeners, false otherwise
 */
export function supportsPassiveEvents(): boolean {
  let supportsPassive = false;
  try {
    // Test via a getter in the options object to see if the passive property is accessed
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {}
  
  return supportsPassive;
}

/**
 * Applies browser-specific fixes and optimizations
 */
export function applyBrowserFixes(): void {
  const { name, version } = detectBrowser();
  
  // Fix for Safari focus issues
  if (name === "Safari") {
    document.body.classList.add('safari-browser');
    
    // Fix for Safari focus outline issues
    const style = document.createElement('style');
    style.textContent = `
      .safari-browser :focus {
        outline: auto 5px -webkit-focus-ring-color !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Fix for older Edge versions
  if (name === "Edge" && parseFloat(version) < 80) {
    document.body.classList.add('legacy-edge');
  }
  
  // Add mobile class if on mobile device
  if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
  }
  
  // Add touch class if on touch device
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }
  
  // Add passive event listeners where supported
  if (supportsPassiveEvents()) {
    document.body.classList.add('supports-passive');
  }
}

/**
 * Logs browser compatibility information to the console
 */
export function logBrowserInfo(): void {
  const { name, version } = detectBrowser();
  console.log(`Browser: ${name} ${version}`);
  console.log(`Mobile Device: ${isMobileDevice()}`);
  console.log(`Touch Device: ${isTouchDevice()}`);
  console.log(`Supports Grid: ${supportsGrid()}`);
  console.log(`Supports Flexbox: ${supportsFlexbox()}`);
  console.log(`Supports CSS Variables: ${supportsCssVariables()}`);
  console.log(`Supports Web Animations: ${supportsWebAnimations()}`);
  console.log(`Supports Passive Events: ${supportsPassiveEvents()}`);
}