
import { supabase } from '@/lib/supabase';
import { Cycle, CycleDay, UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Load user cycle data from Supabase
export const loadUserData = async (userId: string): Promise<UserData> => {
  try {
    // Fetch user profile data
    const profileResponse = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
      
    if (profileResponse.error) throw profileResponse.error;
    const profileData = profileResponse.data?.[0] || null;

    // Fetch cycles
    const cyclesResponse = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId);
      
    if (cyclesResponse.error) throw cyclesResponse.error;
    const cyclesData = cyclesResponse.data || [];
    
    // Sort cycles by start_date in descending order
    cyclesData.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    // Fetch cycle days
    const daysResponse = await supabase
      .from('cycle_days')
      .select('*')
      .eq('user_id', userId);

    if (daysResponse.error) throw daysResponse.error;
    const daysData = daysResponse.data || [];

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

    return {
      cycles,
      averageCycleLength: profileData?.average_cycle_length || DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: profileData?.average_period_length || DEFAULT_PERIOD_LENGTH,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
};

// Save user profile data to Supabase
export const saveUserProfile = async (
  userId: string, 
  averageCycleLength: number, 
  averagePeriodLength: number
) => {
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
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Save cycle data to Supabase
export const saveCycle = async (userId: string, cycle: Cycle) => {
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
    
    return { success: true };
  } catch (error) {
    console.error('Error saving cycle:', error);
    throw error;
  }
};

// Save cycle day data to Supabase
export const saveCycleDay = async (userId: string, cycleId: string, day: CycleDay) => {
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
    
    return { success: true, date: format(day.date, 'yyyy-MM-dd') };
  } catch (error) {
    console.error('Error saving cycle day:', error);
    throw error;
  }
};

// Delete all user data from Supabase
export const deleteUserData = async (userId: string) => {
  try {
    const daysResponse = await supabase
      .from('cycle_days')
      .delete()
      .eq('user_id', userId);
      
    if (daysResponse.error) throw daysResponse.error;
    
    const cyclesResponse = await supabase
      .from('cycles')
      .delete()
      .eq('user_id', userId);
      
    if (cyclesResponse.error) throw cyclesResponse.error;
    
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
