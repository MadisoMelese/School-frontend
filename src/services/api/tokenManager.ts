/**
 * JWT Token Management
 * - Store/retrieve tokens from localStorage
 * - Track token expiry
 * - Validate token expiration
 * - Automatic refresh logic (1 min before expiry)
 */

const TOKEN_STORAGE_KEY = 'schoolos_tokens';
const ACCESS_TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minute in milliseconds

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

/**
 * Get the stored access token
 */
export const getAccessToken = (): string | null => {
  try {
    const tokens = getStoredTokens();
    if (!tokens) return null;

    // Check if token is expired
    if (isAccessTokenExpired(tokens)) {
      return null;
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

/**
 * Get the stored refresh token
 */
export const getRefreshToken = (): string | null => {
  try {
    const tokens = getStoredTokens();
    if (!tokens) return null;

    // Check if refresh token is expired
    if (isRefreshTokenExpired(tokens)) {
      clearTokens();
      return null;
    }

    return tokens.refreshToken;
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Store both access and refresh tokens with expiry times
 */
export const setTokens = (
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresIn: number, // in seconds
  refreshTokenExpiresIn: number // in seconds
): void => {
  try {
    const now = Date.now();
    const tokens: StoredTokens = {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: now + accessTokenExpiresIn * 1000,
      refreshTokenExpiresAt: now + refreshTokenExpiresIn * 1000,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Clear all stored tokens
 */
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Check if access token is expired
 */
export const isAccessTokenExpired = (tokens?: StoredTokens): boolean => {
  try {
    const storedTokens = tokens || getStoredTokens();
    if (!storedTokens) return true;

    const now = Date.now();
    // Consider token expired if it will expire within the buffer time
    return now >= storedTokens.accessTokenExpiresAt - ACCESS_TOKEN_EXPIRY_BUFFER;
  } catch (error) {
    console.error('Error checking access token expiry:', error);
    return true;
  }
};

/**
 * Check if refresh token is expired
 */
export const isRefreshTokenExpired = (tokens?: StoredTokens): boolean => {
  try {
    const storedTokens = tokens || getStoredTokens();
    if (!storedTokens) return true;

    const now = Date.now();
    return now >= storedTokens.refreshTokenExpiresAt;
  } catch (error) {
    console.error('Error checking refresh token expiry:', error);
    return true;
  }
};

/**
 * Check if access token needs refresh (1 min before expiry)
 */
export const shouldRefreshToken = (): boolean => {
  try {
    const tokens = getStoredTokens();
    if (!tokens) return false;

    return isAccessTokenExpired(tokens);
  } catch (error) {
    console.error('Error checking if token should refresh:', error);
    return false;
  }
};

/**
 * Get time remaining for access token (in milliseconds)
 */
export const getAccessTokenTimeRemaining = (): number => {
  try {
    const tokens = getStoredTokens();
    if (!tokens) return 0;

    const now = Date.now();
    const remaining = tokens.accessTokenExpiresAt - now;
    return Math.max(0, remaining);
  } catch (error) {
    console.error('Error getting token time remaining:', error);
    return 0;
  }
};

/**
 * Get stored tokens from localStorage
 */
const getStoredTokens = (): StoredTokens | null => {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) return null;

    return JSON.parse(stored) as StoredTokens;
  } catch (error) {
    console.error('Error parsing stored tokens:', error);
    return null;
  }
};

/**
 * Validate if tokens exist and are not expired
 */
export const hasValidTokens = (): boolean => {
  try {
    const tokens = getStoredTokens();
    if (!tokens) return false;

    return !isAccessTokenExpired(tokens) && !isRefreshTokenExpired(tokens);
  } catch (error) {
    console.error('Error validating tokens:', error);
    return false;
  }
};
