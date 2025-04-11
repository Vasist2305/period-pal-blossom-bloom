
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

  // Load data from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setUserData(initialUserData);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadUserData(user.id);
        setUserData(data);
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

    fetchData();
  }, [user, toast]);

  // Save data to Supabase whenever it changes
  useEffect(() => {
    if (!user || isLoading) return;

    const saveData = async () => {
      try {
        // Update user profile
        await saveUserProfile(
          user.id, 
          userData.averageCycleLength, 
          userData.averagePeriodLength
        );

        // For each cycle, update or insert
        for (const cycle of userData.cycles) {
          await saveCycle(user.id, cycle);
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

    saveData();
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

    const newCycle = createCycle(startDate);
    
    // Calculate average cycle length from previous cycles
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
    return findCycleDay(date, userData.cycles);
  };

  // Get predicted period days
  const getPredictedPeriodDays = (startDate: Date, endDate: Date): Date[] => {
    return calculatePredictedPeriodDays(
      startDate, 
      endDate, 
      userData.cycles, 
      userData.averageCycleLength,
      userData.averagePeriodLength
    );
  };

  // Get fertile window days
  const getFertileWindowDays = (startDate: Date, endDate: Date): Date[] => {
    return calculateFertileWindowDays(
      startDate, 
      endDate, 
      userData.cycles,
      userData.averageCycleLength
    );
  };

  // Get ovulation day
  const getOvulationDay = (cycleStartDate: Date): Date | null => {
    return calculateOvulationDay(cycleStartDate, userData.averageCycleLength);
  };

  // Reset all data
  const resetData = async () => {
    if (!user) return;

    try {
      await deleteUserData(user.id);
      
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
