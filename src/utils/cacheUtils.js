/**
 * Utility functions to handle browser caching
 */

// Add version timestamp to the app
export const APP_VERSION = new Date().getTime();

// Cache refresh period in milliseconds (7 days)
const CACHE_REFRESH_PERIOD = 7 * 24 * 60 * 60 * 1000;

// Generate a cache-busting query parameter based on current timestamp
const getCacheBuster = () => {
  return `?v=${new Date().getTime()}`;
};

// Function to force reload the page with cache busting
const forceCacheRefresh = () => {
  const cacheBuster = getCacheBuster();
  window.location.href = window.location.href.split('?')[0] + cacheBuster;
};

// Check if there's a newer version and reload if needed
export const checkForNewVersion = () => {
  const storedVersion = localStorage.getItem('app_version');
  const lastCacheRefresh = localStorage.getItem('last_cache_refresh');
  const currentTime = new Date().getTime();

  if (!lastCacheRefresh) {
    localStorage.setItem('last_cache_refresh', currentTime.toString());
    localStorage.setItem('app_version', APP_VERSION.toString());
    forceCacheRefresh();
    return;
  }

  // Check if it's been a week since the last cache refresh
  if (lastCacheRefresh && currentTime - parseInt(lastCacheRefresh) > CACHE_REFRESH_PERIOD) {
    // Time to clear cache
    localStorage.setItem('last_cache_refresh', currentTime.toString());
    localStorage.setItem('app_version', APP_VERSION.toString());
    console.log('Weekly cache refresh triggered:', new Date().toISOString());
    forceCacheRefresh();
    return;
  }

  if (storedVersion && storedVersion !== APP_VERSION.toString()) {
    // Update version
    localStorage.setItem('app_version', APP_VERSION.toString());
  } else if (!storedVersion) {
    // First time loading, set version and cache refresh timestamp
    localStorage.setItem('app_version', APP_VERSION.toString());
    localStorage.setItem('last_cache_refresh', currentTime.toString());
  }
};
