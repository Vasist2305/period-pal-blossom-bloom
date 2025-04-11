
import { clearFromLocalStorage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/utils/storageUtils';

// Delete all user data from localStorage
export const deleteUserData = async (userId: string) => {
  try {
    // Clear localStorage
    clearFromLocalStorage(STORAGE_KEYS.USER_DATA);
    clearFromLocalStorage(STORAGE_KEYS.USER_PROFILE);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};
