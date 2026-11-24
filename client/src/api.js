/**
 * Centralized API Client for AI Reads
 * Handles:
 * - Automatic Authorization: Bearer <token> injection
 * - Detection of expired or invalid JWT tokens (401 / 403)
 * - Automatic cleanup of stale credentials from localStorage
 * - Event dispatching to gracefully redirect or prompt login
 */

// Token Storage Helpers
export const getToken = () => {
  try {
    return localStorage.getItem('aireads-token') || null;
  } catch (e) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('aireads-token', token);
    } else {
      localStorage.removeItem('aireads-token');
    }
  } catch (e) {
    console.error('Error saving token to localStorage:', e);
  }
};

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem('aireads-token');
    localStorage.removeItem('aireads-user');
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
};

// Auth Expiry Event Listeners
const authExpiredListeners = new Set();

export const onAuthExpired = (callback) => {
  authExpiredListeners.add(callback);
  return () => authExpiredListeners.delete(callback);
};

export const notifyAuthExpired = (details = {}) => {
  clearAuthStorage();

  // Notify registered callbacks
  authExpiredListeners.forEach((callback) => {
    try {
      callback(details);
    } catch (err) {
      console.error('Error in auth expired listener:', err);
    }
  });

  // Dispatch window event for broad listener coverage
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aireads:session-expired', {
        detail: {
          message: details.error || 'Your session has expired. Please log in again.',
          timestamp: Date.now()
        }
      })
    );
  }
};

/**
 * Universal API Request Handler
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(endpoint, config);
    let data = {};
    const text = await res.text();

    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { rawResponse: text };
    }

    // Intercept 401 Unauthorized or 403 with token errors
    const isTokenError =
      res.status === 401 ||
      (res.status === 403 &&
        (data.code === 'TOKEN_EXPIRED' ||
          data.code === 'TOKEN_INVALID' ||
          /token/i.test(data.error || '')));

    if (isTokenError) {
      console.warn(`[API Client] Session expired or invalid token on ${endpoint}:`, data.error);
      notifyAuthExpired(data);

      const err = new Error(
        data.error || 'Your session has expired. Please log in again to continue.'
      );
      err.status = res.status;
      err.code = data.code || 'TOKEN_EXPIRED';
      err.isAuthExpired = true;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(data.error || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // Intercept network failure (Safari: "Load failed", Chrome: "Failed to fetch")
    if (
      err.name === 'TypeError' &&
      (err.message === 'Load failed' ||
       err.message === 'Failed to fetch' ||
       /network|load failed|failed to fetch/i.test(err.message))
    ) {
      const netErr = new Error('Backend server se sampark nahi ho pa raha hai (Server unreachable). Kripya check karein ki server chal raha hai aur page refresh karein.');
      netErr.isNetworkError = true;
      netErr.originalMessage = err.message;
      throw netErr;
    }
    throw err;
  }
}

// Domain API Services

export const authAPI = {
  getDemoToken: (role = 'student') => apiRequest(`/api/auth/demo-token?role=${role}`),
  login: (email, password) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  signup: (userData) =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  getMe: () => apiRequest('/api/auth/me'),
  updateProfile: (profileData) =>
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
};

export const ordersAPI = {
  getConfig: () => apiRequest('/api/orders/config'),
  createOrder: (bookId) =>
    apiRequest('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify({ bookId })
    }),
  verifyPayment: (payload) =>
    apiRequest('/api/orders/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  unlockFree: (bookId) =>
    apiRequest('/api/orders/unlock-free', {
      method: 'POST',
      body: JSON.stringify({ bookId })
    }),
  getMyOrders: () => apiRequest('/api/orders/my-orders'),
  getAllOrders: () => apiRequest('/api/orders/all')
};

export const booksAPI = {
  getAll: (params = '') => apiRequest(`/api/books${params}`),
  getById: (id) => apiRequest(`/api/books/${id}`)
};

export const libraryAPI = {
  getMyLibrary: () => apiRequest('/api/library'),
  saveBook: (bookId) =>
    apiRequest('/api/library/save', {
      method: 'POST',
      body: JSON.stringify({ bookId })
    }),
  updateProgress: (payload) =>
    apiRequest('/api/library/progress', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getDashboardSummary: () => apiRequest('/api/library/dashboard-summary')
};

export default {
  apiRequest,
  getToken,
  setToken,
  clearAuthStorage,
  onAuthExpired,
  notifyAuthExpired,
  authAPI,
  ordersAPI,
  booksAPI,
  libraryAPI
};
