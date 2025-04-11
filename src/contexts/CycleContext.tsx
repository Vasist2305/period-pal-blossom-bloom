
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Cycle, CycleDay, UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { addDays, subDays, differenceInDays, isSameDay, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CycleContextType {
  userData: UserData;
  currentCycle: Cycle | null;
  isLoading: boolean;
  addCycle: (startDate: Date) => void;
  updateCycleDay: (date: Date, data: Partial<CycleDay>) => void;
  getCycleDay: (date: Date) => CycleDay | null;
  getPredictedPeriodDays: (startDate: Date, endDate: Date) => Date[];
  getFertileWindowDays: (startDate: Date, endDate: Date) => Date[];
  getOvulationDay: (cycleStartDate: Date) => Date | null;
  resetData: () => void;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const useCycleData = () => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycleData must be used within a CycleProvider');
  }
  return context;
};

interface CycleProviderProps {
  children: React.ReactNode;
}

const initialUserData: UserData = {
  cycles: [],
  averageCycleLength: DEFAULT_CYCLE_LENGTH,
  averagePeriodLength: DEFAULT_PERIOD_LENGTH,
  lastUpdated: new Date(),
};

export const CycleProvider: React.FC<CycleProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setUserData(initialUserData);
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch cycles
        const { data: cyclesData, error: cyclesError } = await supabase
          .from('cycles')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (cyclesError) throw cyclesError;

        // Fetch cycle days
        const { data: daysData, error: daysError } = await supabase
          .from('cycle_days')
          .select('*')
          .eq('user_id', user.id);

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

        setUserData({
          cycles,
          averageCycleLength: profileData?.average_cycle_length || DEFAULT_CYCLE_LENGTH,
          averagePeriodLength: profileData?.average_period_length || DEFAULT_PERIOD_LENGTH,
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading your data",
          variant: "destructive"
        });
        setUserData(initialUserData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, toast]);

  // Save data to Supabase whenever it changes
  useEffect(() => {
    if (!user || isLoading) return;

    const saveUserData = async () => {
      try {
        // Update user profile
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            average_cycle_length: userData.averageCycleLength,
            average_period_length: userData.averagePeriodLength,
            updated_at: new Date().toISOString(),
          });

        // For each cycle, update or insert
        for (const cycle of userData.cycles) {
          // Save cycle
          await supabase
            .from('cycles')
            .upsert({
              id: cycle.id,
              user_id: user.id,
              start_date: cycle.startDate.toISOString(),
              end_date: cycle.endDate ? cycle.endDate.toISOString() : null,
              period_length: cycle.periodLength || null,
            });

          // Save cycle days
          for (const day of cycle.days) {
            await supabase
              .from('cycle_days')
              .upsert({
                id: `${cycle.id}-${format(day.date, 'yyyy-MM-dd')}`,
                user_id: user.id,
                cycle_id: cycle.id,
                date: format(day.date, 'yyyy-MM-dd'),
                menstruation: day.menstruation || false,
                flow: day.flow || null,
                symptoms: day.symptoms || [],
                mood: day.mood || null,
                notes: day.notes || null,
              });
          }
        }
      } catch (error) {
        console.error('Error saving user data:', error);
        toast({
          title: "Error saving data",
          description: "There was a problem saving your data",
          variant: "destructive"
        });
      }
    };

    saveUserData();
  }, [userData, isLoading, user, toast]);

  // Calculate and return the current cycle
  const currentCycle = userData.cycles.length > 0 
    ? userData.cycles.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0] 
    : null;

  // Add a new cycle
  const addCycle = async (startDate: Date) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your cycle",
        variant: "destructive"
      });
      return;
    }

    const cycleId = uuidv4();
    const newCycle: Cycle = {
      id: cycleId,
      startDate,
      days: [{
        date: startDate,
        menstruation: true,
        flow: 'medium'
      }],
    };

    // Calculate average cycle length from previous cycles
    const updatedCycles = [...userData.cycles, newCycle];
    let averageCycleLength = DEFAULT_CYCLE_LENGTH;
    let averagePeriodLength = DEFAULT_PERIOD_LENGTH;
    
    if (updatedCycles.length > 1) {
      // Calculate average cycle length
      const cycleLengths = [];
      for (let i = 1; i < updatedCycles.length; i++) {
        const current = updatedCycles[i];
        const previous = updatedCycles[i - 1];
        const length = differenceInDays(current.startDate, previous.startDate);
        if (length > 0 && length < 100) { // Filter out anomalies
          cycleLengths.push(length);
        }
      }
      
      if (cycleLengths.length > 0) {
        averageCycleLength = Math.round(
          cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
        );
      }
      
      // Calculate average period length
      const periodLengths = updatedCycles
        .filter(cycle => cycle.periodLength && cycle.periodLength > 0 && cycle.periodLength < 15)
        .map(cycle => cycle.periodLength as number);
        
      if (periodLengths.length > 0) {
        averagePeriodLength = Math.round(
          periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
        );
      }
    }

    setUserData(prev => ({
      ...prev,
      cycles: updatedCycles,
      averageCycleLength,
      averagePeriodLength,
      lastUpdated: new Date()
    }));

    toast({
      title: "Cycle added",
      description: `New cycle starting ${format(startDate, 'MMM dd, yyyy')} has been added`,
    });
  };

  // Update a specific cycle day
  const updateCycleDay = (date: Date, dayData: Partial<CycleDay>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your cycle",
        variant: "destructive"
      });
      return;
    }

    // Check if the date falls within any existing cycle
    const targetCycleIndex = userData.cycles.findIndex(cycle => {
      // If cycle has an end date, check if date is within range
      if (cycle.endDate) {
        return date >= cycle.startDate && date <= cycle.endDate;
      }
      // If no end date, check if date is after start date
      return date >= cycle.startDate;
    });

    if (targetCycleIndex === -1) {
      // If not found in any cycle, create a new cycle
      if (dayData.menstruation) {
        addCycle(date);
      } else {
        toast({
          title: "No active cycle",
          description: "Please start a period first to track other symptoms",
          variant: "destructive"
        });
      }
      return;
    }

    // Update the cycle
    setUserData(prev => {
      const updatedCycles = [...prev.cycles];
      const targetCycle = { ...updatedCycles[targetCycleIndex] };
      
      // Find existing day or create new one
      const existingDayIndex = targetCycle.days.findIndex(day => 
        isSameDay(new Date(day.date), date)
      );
      
      if (existingDayIndex >= 0) {
        // Update existing day
        targetCycle.days[existingDayIndex] = {
          ...targetCycle.days[existingDayIndex],
          ...dayData
        };
      } else {
        // Add new day
        targetCycle.days.push({
          date,
          menstruation: false,
          ...dayData
        });
      }
      
      // Sort days by date
      targetCycle.days.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Recalculate period length if menstruation status changed
      if (dayData.menstruation !== undefined) {
        const periodDays = targetCycle.days.filter(day => day.menstruation);
        targetCycle.periodLength = periodDays.length;
      }
      
      // Update cycle end date if needed
      if (targetCycle.days.length > 0) {
        const lastDay = targetCycle.days[targetCycle.days.length - 1];
        if (!targetCycle.endDate || lastDay.date > targetCycle.endDate) {
          targetCycle.endDate = lastDay.date;
        }
      }
      
      updatedCycles[targetCycleIndex] = targetCycle;
      
      return {
        ...prev,
        cycles: updatedCycles,
        lastUpdated: new Date()
      };
    });
  };

  // Get a specific cycle day
  const getCycleDay = (date: Date): CycleDay | null => {
    for (const cycle of userData.cycles) {
      const found = cycle.days.find(day => isSameDay(new Date(day.date), date));
      if (found) return found;
    }
    return null;
  };

  // Get predicted period days based on average cycle length
  const getPredictedPeriodDays = (startDate: Date, endDate: Date): Date[] => {
    // Only show predictions if we have at least one cycle
    if (userData.cycles.length === 0) {
      return [];
    }

    const predictedDays: Date[] = [];
    let lastCycleStart: Date;
    
    // Get the start date of the most recent cycle
    if (userData.cycles.length > 0) {
      lastCycleStart = new Date(userData.cycles[0].startDate);
      
      // Predict future periods based on average cycle length
      let currentPrediction = lastCycleStart;
      
      while (currentPrediction <= endDate) {
        // If this prediction is after our start date, add the period days
        if (currentPrediction >= startDate) {
          // Add the predicted period days
          for (let i = 0; i < userData.averagePeriodLength; i++) {
            const periodDay = addDays(currentPrediction, i);
            if (periodDay <= endDate) {
              predictedDays.push(periodDay);
            }
          }
        }
        
        // Move to the next predicted cycle
        currentPrediction = addDays(currentPrediction, userData.averageCycleLength);
      }
    }
    
    return predictedDays;
  };

  // Get fertile window days (typically 5 days before ovulation plus ovulation day)
  const getFertileWindowDays = (startDate: Date, endDate: Date): Date[] => {
    if (userData.cycles.length === 0) {
      return [];
    }

    const fertileDays: Date[] = [];
    const lastCycleStart = new Date(userData.cycles[0].startDate);
    let currentCycleStart = lastCycleStart;
    
    // For each potential cycle in our range
    while (currentCycleStart <= endDate) {
      const ovulationDay = getOvulationDay(currentCycleStart);
      
      if (ovulationDay) {
        // Fertile window: 5 days before ovulation + ovulation day
        for (let i = -5; i <= 0; i++) {
          const fertileDay = addDays(ovulationDay, i);
          if (fertileDay >= startDate && fertileDay <= endDate) {
            fertileDays.push(fertileDay);
          }
        }
      }
      
      // Move to next predicted cycle
      currentCycleStart = addDays(currentCycleStart, userData.averageCycleLength);
    }
    
    return fertileDays;
  };

  // Get ovulation day (typically 14 days before the next period)
  const getOvulationDay = (cycleStartDate: Date): Date | null => {
    if (!cycleStartDate) return null;
    
    // Ovulation typically occurs 14 days before the next period
    const daysUntilNextPeriod = userData.averageCycleLength - 14;
    return addDays(cycleStartDate, daysUntilNextPeriod);
  };

  // Reset all data
  const resetData = async () => {
    if (!user) return;

    try {
      // Delete all user data from Supabase
      await supabase
        .from('cycle_days')
        .delete()
        .eq('user_id', user.id);
      
      await supabase
        .from('cycles')
        .delete()
        .eq('user_id', user.id);
      
      // Reset local state
      setUserData(initialUserData);
      
      toast({
        title: "Data reset",
        description: "All your cycle data has been reset",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Error",
        description: "There was a problem resetting your data",
        variant: "destructive"
      });
    }
  };

  return (
    <CycleContext.Provider
      value={{
        userData,
        currentCycle,
        isLoading,
        addCycle,
        updateCycleDay,
        getCycleDay,
        getPredictedPeriodDays,
        getFertileWindowDays,
        getOvulationDay,
        resetData
      }}
    >
      {children}
    </CycleContext.Provider>
  );
};
