/**
 * Blockchain ID utility functions
 * Generates and manages unique 24-digit blockchain identifiers for users
 */

/**
 * Generates a cryptographically secure 24-digit numeric string
 * @returns {string} A 24-digit blockchain ID
 */
export function generateBlockchainId(): string {
  // Generate 24 random digits using crypto.getRandomValues for security
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  
  // Convert to digits (0-9) and join
  return Array.from(array, byte => (byte % 10).toString()).join('');
}

/**
 * Validates if a string is a valid 24-digit blockchain ID
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidBlockchainId(id: string): boolean {
  return /^\d{24}$/.test(id);
}

/**
 * Formats a blockchain ID for display with spacing for readability
 * @param {string} id - The 24-digit blockchain ID
 * @returns {string} Formatted ID with spaces (e.g., "123456 789012 345678 901234")
 */
export function formatBlockchainId(id: string): string {
  if (!isValidBlockchainId(id)) {
    return id;
  }
  
  return id.replace(/(\d{6})/g, '$1 ').trim();
}

/**
 * Creates a shortened version of the blockchain ID for compact display
 * @param {string} id - The 24-digit blockchain ID
 * @returns {string} Shortened ID (first 6 + ... + last 6 digits)
 */
export function shortenBlockchainId(id: string): string {
  if (!isValidBlockchainId(id)) {
    return id;
  }
  
  return `${id.substring(0, 6)}...${id.substring(18)}`;
}