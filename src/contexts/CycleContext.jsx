
import React, { createContext, useContext } from 'react';
import { useCycleData as useDataHook } from '@/hooks/useCycleData';

// Create cycle context
const CycleContext = createContext(undefined);

export const useCycleContext = () => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycleContext must be used within a CycleProvider');
  }
  return context;
};

export const CycleProvider = ({ children }) => {
  const cycleData = useDataHook();
  
  return (
    <CycleContext.Provider value={cycleData}>
      {children}
    </CycleContext.Provider>
  );
};

// Export the consumer hook for easy access
export const useCycleData = useCycleContext;
