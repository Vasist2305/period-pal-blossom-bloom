
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Cycle, CycleDay, UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { supabase } from '@/lib/supabase';

// Local storage keys
const STORAGE_KEYS = {
  USER_DATA: 'her_cycle_diary_user_data',
  USER_PROFILE: 'her_cycle_diary_user_profile'
};

// Load user cycle data - will try localStorage first, then fall back to defaults
export const loadUserData = async (userId: string): Promise<UserData> => {
  try {
    // First, check localStorage
    const storedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Convert string dates back to Date objects
      return {
        ...parsedData,
        lastUpdated: new Date(parsedData.lastUpdated),
        cycles: parsedData.cycles.map((cycle: any) => ({
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
    const defaultData = {
      cycles: [],
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      lastUpdated: new Date(),
    };
    
    // Save default data to localStorage
    saveToLocalStorage(defaultData);
    
    return defaultData;
  } catch (error) {
    console.error('Error loading user data:', error);
    // In case of any error, return default data
    const defaultData = {
      cycles: [],
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      lastUpdated: new Date(),
    };
    
    return defaultData;
  }
};

// Helper function to save data to localStorage
const saveToLocalStorage = (userData: UserData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

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
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileData));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Save cycle data to localStorage
export const saveCycle = async (userId: string, cycle: Cycle) => {
  try {
    // Update localStorage with the updated cycle
    const storedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedData) {
      const userData = JSON.parse(storedData);
      const existingCycleIndex = userData.cycles.findIndex((c: any) => c.id === cycle.id);
      
      if (existingCycleIndex >= 0) {
        userData.cycles[existingCycleIndex] = cycle;
      } else {
        userData.cycles.push(cycle);
      }
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving cycle:', error);
    throw error;
  }
};

// Save cycle day data to localStorage
export const saveCycleDay = async (userId: string, cycleId: string, day: CycleDay) => {
  try {
    // Update the day in localStorage
    const storedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedData) {
      const userData = JSON.parse(storedData);
      const cycleIndex = userData.cycles.findIndex((c: any) => c.id === cycleId);
      
      if (cycleIndex >= 0) {
        const dayIndex = userData.cycles[cycleIndex].days.findIndex(
          (d: any) => new Date(d.date).toDateString() === day.date.toDateString()
        );
        
        if (dayIndex >= 0) {
          userData.cycles[cycleIndex].days[dayIndex] = day;
        } else {
          userData.cycles[cycleIndex].days.push(day);
        }
        
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
    }
    
    return { success: true, date: format(day.date, 'yyyy-MM-dd') };
  } catch (error) {
    console.error('Error saving cycle day:', error);
    throw error;
  }
};

// Delete all user data from localStorage
export const deleteUserData = async (userId: string) => {
  try {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

// Create a new cycle entry
export const createCycle = (startDate: Date): Cycle => {
  return {
    id: uuidv4(),
    startDate,
    days: [{
      date: startDate,
      menstruation: true,
      flow: 'medium'
    }],
  };
};
