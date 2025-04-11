
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Cycle, CycleDay, UserData } from '@/types';
import { createCycle } from '@/services/cycleDataService';
import { calculateAverages } from '@/utils/cycleCalculations';

export const useCycleActions = (
  userData: UserData,
  setUserData: React.Dispatch<React.SetStateAction<UserData>>,
  getUserId: () => string
) => {
  const { toast } = useToast();

  // Add a new cycle
  const addCycle = async (startDate: Date) => {
    const userId = getUserId();

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

  return {
    addCycle,
    updateCycleDay
  };
};
