
// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  USER_PROFILE: 'user_profile',
};

// Get data from localStorage
export const getFromLocalStorage = (key, userId = null) => {
  const storageKey = userId ? `${key}_${userId}` : key;
  const data = localStorage.getItem(storageKey);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return null;
  }
};

// Save data to localStorage
export const saveToLocalStorage = (key, data, userId = null) => {
  const storageKey = userId ? `${key}_${userId}` : key;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    return false;
  }
};

// Clear data from localStorage
export const clearFromLocalStorage = (key, userId = null) => {
  const storageKey = userId ? `${key}_${userId}` : key;
  localStorage.removeItem(storageKey);
};
