
import React, { createContext, useContext } from 'react';
import { Cycle, CycleDay, UserData } from '@/types';
import { useCycleData as useDataHook } from '@/hooks/useCycleData';

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
  const cycleData = useDataHook();
  
  return (
    <CycleContext.Provider value={cycleData}>
      {children}
    </CycleContext.Provider>
  );
};

// Export the consumer hook for easy access
export const useCycleData = useCycleContext;
