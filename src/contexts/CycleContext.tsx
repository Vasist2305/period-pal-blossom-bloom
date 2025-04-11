
import React, { createContext, useContext } from 'react';
import { Cycle, CycleDay, UserData } from '@/types';
import { useCycleData } from '@/hooks/useCycleData';
import { useCycleHelpers } from '@/hooks/useCycleHelpers';

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

export const useCycleContext = () => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycleContext must be used within a CycleProvider');
  }
  return context;
};

interface CycleProviderProps {
  children: React.ReactNode;
}

export const CycleProvider: React.FC<CycleProviderProps> = ({ children }) => {
  // Use the custom hook for data management
  const { 
    userData, 
    isLoading, 
    addCycle, 
    updateCycleDay, 
    resetData 
  } = useCycleData();
  
  // Use the helper hook for cycle calculations
  const { 
    currentCycle, 
    getCycleDay, 
    getPredictedPeriodDays, 
    getFertileWindowDays, 
    getOvulationDay 
  } = useCycleHelpers(
    userData.cycles, 
    userData.averageCycleLength, 
    userData.averagePeriodLength
  );

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

// Export the consumer hook with the original name for backward compatibility
export const useCycleData = useCycleContext;
