
import { STORAGE_KEYS, saveToLocalStorage } from '@/utils/storageUtils';

// Save user profile data to localStorage
export const saveUserProfile = async (
  userId: string, 
  averageCycleLength: number, 
  averagePeriodLength: number
) => {
  try {
    // Save to localStorage
    const profileData = { 
      averageCycleLength, 
      averagePeriodLength, 
      userId,
      updatedAt: new Date().toISOString() 
    };
    saveToLocalStorage(STORAGE_KEYS.USER_PROFILE, profileData);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};
