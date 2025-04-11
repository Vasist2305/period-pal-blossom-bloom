import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Cycle, CycleDay, UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { supabase } from '@/lib/supabase';

// Local storage keys
const STORAGE_KEYS = {
  USER_DATA: 'her_cycle_diary_user_data',
  USER_PROFILE: 'her_cycle_diary_user_profile'
};

// Load user cycle data - will try Supabase first, then fall back to localStorage
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

    // If no localStorage data, try Supabase
    try {
      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;

      // Fetch cycles
      const { data: cyclesData = [], error: cyclesError } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId);
        
      if (cyclesError) throw cyclesError;
      
      // Sort cycles by start_date in descending order
      cyclesData.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

      // Fetch cycle days
      const { data: daysData = [], error: daysError } = await supabase
        .from('cycle_days')
        .select('*')
        .eq('user_id', userId);

      if (daysError) throw daysError;

      // Map data to our format
      const cycles = cyclesData.map((cycle) => {
        const cycleDays = daysData
          .filter((day) => day.cycle_id === cycle.id)
          .map((day) => ({
            date: new Date(day.date),
            menstruation: day.menstruation,
            flow: day.flow,
            symptoms: day.symptoms || [],
            mood: day.mood,
            notes: day.notes,
          }));

        return {
          id: cycle.id,
          startDate: new Date(cycle.start_date),
          endDate: cycle.end_date ? new Date(cycle.end_date) : undefined,
          periodLength: cycle.period_length,
          days: cycleDays,
        };
      });

      const userData = {
        cycles,
        averageCycleLength: profileData?.average_cycle_length || DEFAULT_CYCLE_LENGTH,
        averagePeriodLength: profileData?.average_period_length || DEFAULT_PERIOD_LENGTH,
        lastUpdated: new Date(),
      };

      // Save to localStorage for future use
      saveToLocalStorage(userData);

      return userData;
    } catch (supabaseError) {
      console.warn('Supabase error, using default data:', supabaseError);
      // If Supabase fails, return default data
      const defaultData = {
        cycles: [],
        averageCycleLength: DEFAULT_CYCLE_LENGTH,
        averagePeriodLength: DEFAULT_PERIOD_LENGTH,
        lastUpdated: new Date(),
      };
      
      // Save default data to localStorage
      saveToLocalStorage(defaultData);
      
      return defaultData;
    }
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

// Save user profile data - try Supabase first, then localStorage
export const saveUserProfile = async (
  userId: string, 
  averageCycleLength: number, 
  averagePeriodLength: number
) => {
  try {
    // Try to save to Supabase
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          average_cycle_length: averageCycleLength,
          average_period_length: averagePeriodLength,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
    } catch (supabaseError) {
      console.warn('Failed to save to Supabase, saving to localStorage instead');
    }
    
    // Always save to localStorage as well
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

// Save cycle data (try Supabase, always save to localStorage)
export const saveCycle = async (userId: string, cycle: Cycle) => {
  try {
    // Try to save to Supabase
    try {
      const { error } = await supabase
        .from('cycles')
        .upsert({
          id: cycle.id,
          user_id: userId,
          start_date: cycle.startDate.toISOString(),
          end_date: cycle.endDate ? cycle.endDate.toISOString() : null,
          period_length: cycle.periodLength || null,
        });
        
      if (error) throw error;

      // Save cycle days
      for (const day of cycle.days) {
        await saveCycleDay(userId, cycle.id, day);
      }
    } catch (supabaseError) {
      console.warn('Failed to save cycle to Supabase, using localStorage instead');
    }
    
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

// Save cycle day data (try Supabase, always save to localStorage)
export const saveCycleDay = async (userId: string, cycleId: string, day: CycleDay) => {
  try {
    // Try to save to Supabase
    try {
      const { error } = await supabase
        .from('cycle_days')
        .upsert({
          id: `${cycleId}-${format(day.date, 'yyyy-MM-dd')}`,
          user_id: userId,
          cycle_id: cycleId,
          date: format(day.date, 'yyyy-MM-dd'),
          menstruation: day.menstruation || false,
          flow: day.flow || null,
          symptoms: day.symptoms || [],
          mood: day.mood || null,
          notes: day.notes || null,
        });
        
      if (error) throw error;
    } catch (supabaseError) {
      console.warn('Failed to save cycle day to Supabase, using localStorage only');
    }
    
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

// Delete all user data (from Supabase and localStorage)
export const deleteUserData = async (userId: string) => {
  try {
    // Try to delete from Supabase
    try {
      const { error: daysError } = await supabase
        .from('cycle_days')
        .delete()
        .eq('user_id', userId);
        
      if (daysError) throw daysError;
      
      const { error: cyclesError } = await supabase
        .from('cycles')
        .delete()
        .eq('user_id', userId);
        
      if (cyclesError) throw cyclesError;
    } catch (supabaseError) {
      console.warn('Failed to delete from Supabase, clearing localStorage only');
    }
    
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
