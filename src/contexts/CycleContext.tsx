import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cycle, CycleDay, UserData, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@/types';
import { isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  calculateOvulationDay, 
  calculatePredictedPeriodDays, 
  calculateFertileWindowDays,
  findCycleDay,
  calculateAverages
} from '@/utils/cycleCalculations';
import {
  loadUserData,
  saveUserProfile,
  saveCycle,
  deleteUserData,
  createCycle
} from '@/services/cycleDataService';

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
  const [dataError, setDataError] = useState<Error | null>(null);

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

  const currentCycle = userData.cycles.length > 0 
    ? userData.cycles.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0] 
    : null;

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
        isSameDay(new Date(day.date), date)
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

  const getCycleDay = (date: Date): CycleDay | null => {
    return findCycleDay(date, userData.cycles);
  };

  const getPredictedPeriodDays = (startDate: Date, endDate: Date): Date[] => {
    return calculatePredictedPeriodDays(
      startDate, 
      endDate, 
      userData.cycles, 
      userData.averageCycleLength,
      userData.averagePeriodLength
    );
  };

  const getFertileWindowDays = (startDate: Date, endDate: Date): Date[] => {
    return calculateFertileWindowDays(
      startDate, 
      endDate, 
      userData.cycles,
      userData.averageCycleLength
    );
  };

  const getOvulationDay = (cycleStartDate: Date): Date | null => {
    return calculateOvulationDay(cycleStartDate, userData.averageCycleLength);
  };

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
