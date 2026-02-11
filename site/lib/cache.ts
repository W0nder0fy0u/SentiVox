/**
 * Client-side cache utility for static pages
 * Caches /about and /docs pages since they don't change at runtime
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
}

const APP_VERSION = "1.0.0"; // Update this when you want to invalidate cache
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class StaticPageCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private storageAvailable: boolean;

  constructor() {
    // Check if sessionStorage is available
    this.storageAvailable = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    try {
      const test = "__storage_test__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getCacheKey(path: string): string {
    return `static_page_${path}`;
  }

  /**
   * Get cached data for a static page
   */
  get(path: string): any | null {
    // Try memory cache first
    const memEntry = this.memoryCache.get(path);
    if (memEntry && this.isValid(memEntry)) {
      return memEntry.data;
    }

    // Try sessionStorage as fallback
    if (this.storageAvailable) {
      try {
        const stored = sessionStorage.getItem(this.getCacheKey(path));
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          if (this.isValid(entry)) {
            // Restore to memory cache
            this.memoryCache.set(path, entry);
            return entry.data;
          } else {
            // Invalid cache, remove it
            sessionStorage.removeItem(this.getCacheKey(path));
          }
        }
      } catch (error) {
        console.warn("Failed to read from sessionStorage:", error);
      }
    }

    return null;
  }

  /**
   * Set cached data for a static page
   */
  set(path: string, data: any): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: APP_VERSION,
    };

    // Store in memory cache
    this.memoryCache.set(path, entry);

    // Store in sessionStorage as backup
    if (this.storageAvailable) {
      try {
        sessionStorage.setItem(this.getCacheKey(path), JSON.stringify(entry));
      } catch (error) {
        console.warn("Failed to write to sessionStorage:", error);
      }
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    // Check version
    if (entry.version !== APP_VERSION) {
      return false;
    }

    // Check expiration
    const age = Date.now() - entry.timestamp;
    return age < CACHE_DURATION;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.memoryCache.clear();

    if (this.storageAvailable) {
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("static_page_")) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn("Failed to clear sessionStorage:", error);
      }
    }
  }
}

// Export singleton instance
export const staticPageCache = new StaticPageCache();
