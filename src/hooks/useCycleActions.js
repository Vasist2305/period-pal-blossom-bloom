
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { calculateAverages } from '@/utils/cycleCalculations';

export const useCycleActions = (
  userData,
  setUserData,
  getUserId
) => {
  const { toast } = useToast();

  // Helper to create a new cycle
  const createCycle = (startDate) => {
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

  // Add a new cycle
  const addCycle = async (startDate) => {
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
  const updateCycleDay = (date, dayData) => {
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
