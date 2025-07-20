import {
  detectBrowser,
  isMobileDevice,
  isTouchDevice,
  supportsGrid,
  supportsFlexbox,
  supportsCssVariables,
  supportsWebAnimations,
  supportsPassiveEvents,
  applyBrowserFixes
} from '../browserCompatibility';

describe('Browser Compatibility Utilities', () => {
  // Save original navigator and window objects
  const originalNavigator = global.navigator;
  const originalWindow = global.window;
  const originalDocument = global.document;
  
  // Mock document methods and properties
  beforeEach(() => {
    // Mock document
    global.document = {
      ...originalDocument,
      createElement: jest.fn().mockReturnValue({
        animate: jest.fn(),
        style: {}
      }),
      body: {
        classList: {
          add: jest.fn()
        }
      },
      head: {
        appendChild: jest.fn()
      }
    } as any;
    
    // Mock window
    global.window = {
      ...originalWindow,
      CSS: {
        supports: jest.fn().mockImplementation((prop: string, value: string) => {
          if (prop === 'display' && value === 'grid') return true;
          if (prop === 'display' && value === 'flex') return true;
          if (prop === '--custom-prop') return true;
          return false;
        })
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as any;
  });
  
  // Restore original objects
  afterEach(() => {
    global.navigator = originalNavigator;
    global.window = originalWindow;
    global.document = originalDocument;
    jest.restoreAllMocks();
  });
  
  describe('detectBrowser', () => {
    it('should detect Chrome browser', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      } as any;
      
      const result = detectBrowser();
      expect(result.name).toBe('Chrome');
      expect(result.version).toBe('91.0');
    });
    
    it('should detect Firefox browser', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      } as any;
      
      const result = detectBrowser();
      expect(result.name).toBe('Firefox');
      expect(result.version).toBe('89.0');
    });
    
    it('should detect Safari browser', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      } as any;
      
      const result = detectBrowser();
      expect(result.name).toBe('Safari');
      expect(result.version).toBe('14.1');
    });
    
    it('should detect Edge browser', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      } as any;
      
      const result = detectBrowser();
      expect(result.name).toBe('Edge');
      expect(result.version).toBe('91.0');
    });
  });
  
  describe('isMobileDevice', () => {
    it('should detect mobile device', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      } as any;
      
      expect(isMobileDevice()).toBe(true);
    });
    
    it('should detect non-mobile device', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      } as any;
      
      expect(isMobileDevice()).toBe(false);
    });
  });
  
  describe('isTouchDevice', () => {
    it('should detect touch device with ontouchstart', () => {
      global.window = {
        ...originalWindow,
        ontouchstart: {} as any
      } as any;
      
      expect(isTouchDevice()).toBe(true);
    });
    
    it('should detect touch device with maxTouchPoints', () => {
      global.navigator = {
        ...originalNavigator,
        maxTouchPoints: 5
      } as any;
      
      expect(isTouchDevice()).toBe(true);
    });
    
    it('should detect non-touch device', () => {
      global.window = { ...originalWindow } as any;
      global.navigator = {
        ...originalNavigator,
        maxTouchPoints: 0
      } as any;
      
      expect(isTouchDevice()).toBe(false);
    });
  });
  
  describe('CSS Support Detection', () => {
    it('should detect CSS Grid support', () => {
      expect(supportsGrid()).toBe(true);
    });
    
    it('should detect CSS Flexbox support', () => {
      expect(supportsFlexbox()).toBe(true);
    });
    
    it('should detect CSS Variables support', () => {
      expect(supportsCssVariables()).toBe(true);
    });
  });
  
  describe('Web Animation API Support', () => {
    it('should detect Web Animation API support', () => {
      expect(supportsWebAnimations()).toBe(true);
    });
  });
  
  describe('Passive Events Support', () => {
    it('should detect passive events support', () => {
      // Mock implementation to simulate passive events support
      Object.defineProperty = jest.fn().mockImplementation(() => true);
      expect(supportsPassiveEvents()).toBe(true);
    });
  });
  
  describe('applyBrowserFixes', () => {
    it('should apply Safari fixes when Safari is detected', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      } as any;
      
      applyBrowserFixes();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('safari-browser');
      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(document.head.appendChild).toHaveBeenCalled();
    });
    
    it('should apply mobile device class when mobile device is detected', () => {
      global.navigator = {
        ...originalNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      } as any;
      
      applyBrowserFixes();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('mobile-device');
    });
  });
});