export const USER_ID_KEY = 'mini-ally-user-id';

export function generateUserId(): string {
  // Generate a random user ID in the format: ma-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  const segments = [
    'ma',
    Math.random().toString(36).substring(2, 10),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 14)
  ];
  
  return segments.join('-');
}

export function getUserId(): string {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Try to get existing user ID from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);
  
  // If no user ID exists, generate a new one
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
}