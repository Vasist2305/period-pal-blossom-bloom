
// Storage keys constants
export const STORAGE_KEYS = {
  USER_DATA: 'her_cycle_diary_user_data',
  USER_PROFILE: 'her_cycle_diary_user_profile'
};

// Generic function to save data to localStorage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage with key ${key}:`, error);
  }
};

// Generic function to get data from localStorage
export const getFromLocalStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting from localStorage with key ${key}:`, error);
    return null;
  }
};

// Clear specific data from localStorage
export const clearFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing localStorage with key ${key}:`, error);
  }
};
