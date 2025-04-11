
import { UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage } from '@/utils/storageUtils';

// Load user cycle data from localStorage
export const loadUserData = async (userId: string): Promise<UserData> => {
  try {
    // Check localStorage
    const storedData = getFromLocalStorage<any>(STORAGE_KEYS.USER_DATA);
    if (storedData) {
      // Convert string dates back to Date objects
      return {
        ...storedData,
        lastUpdated: new Date(storedData.lastUpdated),
        cycles: storedData.cycles.map((cycle: any) => ({
          ...cycle,
          startDate: new Date(cycle.startDate),
          endDate: cycle.endDate ? new Date(cycle.endDate) : undefined,
          days: cycle.days.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }))
        }))
      };
    }

    // If no localStorage data, use default data
    console.log('No localStorage data found, using defaults');
    const defaultData: UserData = {
      cycles: [],
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      lastUpdated: new Date(),
    };
    
    // Save default data to localStorage
    saveToLocalStorage(STORAGE_KEYS.USER_DATA, defaultData);
    
    return defaultData;
  } catch (error) {
    console.error('Error loading user data:', error);
    // In case of any error, return default data
    const defaultData: UserData = {
      cycles: [],
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      lastUpdated: new Date(),
    };
    
    return defaultData;
  }
};
