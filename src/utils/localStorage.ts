export const STORAGE_KEYS = {
  USER: 'tourist_safety_user',
  AUTH_TOKEN: 'tourist_safety_auth',
  CONTACTS: 'tourist_safety_contacts',
  TRIPS: 'tourist_safety_trips',
  REPORTS: 'tourist_safety_reports',
  SLEEP_MODE: 'tourist_safety_sleep_mode',
  TRACKING_HISTORY: 'tourist_safety_tracking',
} as const;

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};