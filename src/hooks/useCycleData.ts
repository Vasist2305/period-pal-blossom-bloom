
import { useState, useEffect } from 'react';
import { Cycle, CycleDay, UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  loadUserData,
  saveUserProfile,
  saveCycle,
  deleteUserData,
  createCycle
} from '@/services/cycleDataService';
import {
  calculateAverages
} from '@/utils/cycleCalculations';

const initialUserData: UserData = {
  cycles: [],
  averageCycleLength: DEFAULT_CYCLE_LENGTH,
  averagePeriodLength: DEFAULT_PERIOD_LENGTH,
  lastUpdated: new Date(),
};

export const useCycleData = () => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [dataError, setDataError] = useState<Error | null>(null);

  // Fetch user data on mount and when user changes
  useEffect(() => {
    if (!user) {
      setUserData(initialUserData);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setDataError(null);
      
      try {
        const data = await loadUserData(user.id);
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
        setDataError(error instanceof Error ? error : new Error('Unknown error loading data'));
        
        if (!import.meta.env.DEV || !(error instanceof Error && error.message.includes('supabase'))) {
          toast({
            title: "Error loading data",
            description: "There was a problem loading your data. Using default data for now.",
            variant: "destructive"
          });
        }
        
        setUserData(initialUserData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Save data whenever it changes
  useEffect(() => {
    if (!user || isLoading || dataError) return;

    const saveData = async () => {
      try {
        await saveUserProfile(
          user.id, 
          userData.averageCycleLength, 
          userData.averagePeriodLength
        );

        for (const cycle of userData.cycles) {
          await saveCycle(user.id, cycle);
        }
      } catch (error) {
        console.error('Error saving user data:', error);
        
        if (!import.meta.env.DEV || !(error instanceof Error && error.message.includes('supabase'))) {
          toast({
            title: "Error saving data",
            description: "There was a problem saving your data",
            variant: "destructive"
          });
        }
      }
    };

    if (import.meta.env.DEV && dataError && dataError.message.includes('supabase')) {
      console.info('Skipping data save in development mode with Supabase connection issues');
      return;
    }
    
    saveData();
  }, [userData, isLoading, user, toast, dataError]);

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

    const newCycle = createCycle(startDate);
    
    const updatedCycles = [...userData.cycles, newCycle];
    const { averageCycleLength, averagePeriodLength } = calculateAverages(updatedCycles);

    setUserData(prev => ({
      ...prev,
      cycles: updatedCycles,
      averageCycleLength,
      averagePeriodLength,
      lastUpdated: new Date()
    }));

    toast({
      title: "Cycle added",
      description: `New cycle starting ${startDate.toLocaleDateString()} has been added`,
    });
  };

  // Update a cycle day
  const updateCycleDay = (date: Date, dayData: Partial<CycleDay>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your cycle",
        variant: "destructive"
      });
      return;
    }

    const targetCycleIndex = userData.cycles.findIndex(cycle => {
      if (cycle.endDate) {
        return date >= cycle.startDate && date <= cycle.endDate;
      }
      return date >= cycle.startDate;
    });

    if (targetCycleIndex === -1) {
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

    setUserData(prev => {
      const updatedCycles = [...prev.cycles];
      const targetCycle = { ...updatedCycles[targetCycleIndex] };
      
      const existingDayIndex = targetCycle.days.findIndex(day => 
        new Date(day.date).toDateString() === date.toDateString()
      );
      
      if (existingDayIndex >= 0) {
        targetCycle.days[existingDayIndex] = {
          ...targetCycle.days[existingDayIndex],
          ...dayData
        };
      } else {
        targetCycle.days.push({
          date,
          menstruation: false,
          ...dayData
        });
      }
      
      targetCycle.days.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      if (dayData.menstruation !== undefined) {
        const periodDays = targetCycle.days.filter(day => day.menstruation);
        targetCycle.periodLength = periodDays.length;
      }
      
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

  // Reset all user data
  const resetData = async () => {
    if (!user) return;

    try {
      await deleteUserData(user.id);
      
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

  return {
    userData,
    isLoading,
    addCycle,
    updateCycleDay,
    resetData
  };
};
