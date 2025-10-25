// Token utilities for authentication
export const tokenUtils = {
  // Set tokens in localStorage
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  // Get access token from localStorage
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  // Get refresh token from localStorage
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },

  // Clear tokens from localStorage
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // Check if token is expired
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If token is malformed, consider it expired
    }
  },

  // Check if token is valid (not expired)
  isValidToken: (token: string): boolean => {
    return !tokenUtils.isTokenExpired(token);
  },

  // Check if token is expiring soon (within 5 minutes)
  isTokenExpiringSoon: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds
      return payload.exp - currentTime < fiveMinutes;
    } catch (error) {
      return true; // If token is malformed, consider it expiring soon
    }
  },

  // Get token payload
  getTokenPayload: (token: string): any => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  },
};
