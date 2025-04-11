
import { format } from 'date-fns';
import { Cycle, CycleDay, UserData } from '@/types';
import { STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage } from '@/utils/storageUtils';

// Save cycle data to localStorage
export const saveCycle = async (userId: string, cycle: Cycle) => {
  try {
    // Update localStorage with the updated cycle
    const userData = getFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
    if (userData) {
      const existingCycleIndex = userData.cycles.findIndex((c) => c.id === cycle.id);
      
      if (existingCycleIndex >= 0) {
        userData.cycles[existingCycleIndex] = cycle;
      } else {
        userData.cycles.push(cycle);
      }
      
      saveToLocalStorage(STORAGE_KEYS.USER_DATA, userData);
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
    const userData = getFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
    if (userData) {
      const cycleIndex = userData.cycles.findIndex((c) => c.id === cycleId);
      
      if (cycleIndex >= 0) {
        const dayIndex = userData.cycles[cycleIndex].days.findIndex(
          (d) => new Date(d.date).toDateString() === day.date.toDateString()
        );
        
        if (dayIndex >= 0) {
          userData.cycles[cycleIndex].days[dayIndex] = day;
        } else {
          userData.cycles[cycleIndex].days.push(day);
        }
        
        saveToLocalStorage(STORAGE_KEYS.USER_DATA, userData);
      }
    }
    
    return { success: true, date: format(day.date, 'yyyy-MM-dd') };
  } catch (error) {
    console.error('Error saving cycle day:', error);
    throw error;
  }
};
