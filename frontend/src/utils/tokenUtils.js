/**
 * JWT helpers for access tokens that use a standard `exp` claim (seconds since epoch).
 * For opaque tokens without a parseable payload, helpers treat expiration as unknown
 * (not expired / not near expiration) so sessions are not cleared incorrectly.
 */

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * @param {string} token
 * @returns {number|null} Expiration time in milliseconds, or null if unknown
 */
export function getTokenExpiration(token) {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return null
  return payload.exp * 1000
}

/**
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const expMs = getTokenExpiration(token)
  if (expMs === null) return false
  return Date.now() >= expMs
}

/**
 * @param {string} token
 * @param {number} bufferMinutes
 * @returns {boolean}
 */
export function isTokenNearExpiration(token, bufferMinutes = 5) {
  const expMs = getTokenExpiration(token)
  if (expMs === null) return false
  const bufferMs = Math.max(0, Number(bufferMinutes) || 0) * 60 * 1000
  return expMs - Date.now() <= bufferMs
}
