
import { addDays, subDays, differenceInDays, isSameDay, format } from 'date-fns';
import { Cycle, CycleDay, DEFAULT_CYCLE_LENGTH } from '@/types';

// Calculate ovulation day (typically 14 days before the next period)
export const calculateOvulationDay = (cycleStartDate: Date, averageCycleLength: number): Date | null => {
  if (!cycleStartDate) return null;
  
  // Ovulation typically occurs 14 days before the next period
  const daysUntilNextPeriod = averageCycleLength - 14;
  return addDays(cycleStartDate, daysUntilNextPeriod);
};

// Get predicted period days based on average cycle length
export const calculatePredictedPeriodDays = (
  startDate: Date, 
  endDate: Date, 
  cycles: Cycle[], 
  averageCycleLength: number,
  averagePeriodLength: number
): Date[] => {
  // Only show predictions if we have at least one cycle
  if (cycles.length === 0) {
    return [];
  }

  const predictedDays: Date[] = [];
  
  // Get the start date of the most recent cycle
  if (cycles.length > 0) {
    const lastCycleStart = new Date(cycles[0].startDate);
    
    // Predict future periods based on average cycle length
    let currentPrediction = lastCycleStart;
    
    while (currentPrediction <= endDate) {
      // If this prediction is after our start date, add the period days
      if (currentPrediction >= startDate) {
        // Add the predicted period days
        for (let i = 0; i < averagePeriodLength; i++) {
          const periodDay = addDays(currentPrediction, i);
          if (periodDay <= endDate) {
            predictedDays.push(periodDay);
          }
        }
      }
      
      // Move to the next predicted cycle
      currentPrediction = addDays(currentPrediction, averageCycleLength);
    }
  }
  
  return predictedDays;
};

// Get fertile window days (typically 5 days before ovulation plus ovulation day)
export const calculateFertileWindowDays = (
  startDate: Date, 
  endDate: Date, 
  cycles: Cycle[],
  averageCycleLength: number
): Date[] => {
  if (cycles.length === 0) {
    return [];
  }

  const fertileDays: Date[] = [];
  const lastCycleStart = new Date(cycles[0].startDate);
  let currentCycleStart = lastCycleStart;
  
  // For each potential cycle in our range
  while (currentCycleStart <= endDate) {
    const ovulationDay = calculateOvulationDay(currentCycleStart, averageCycleLength);
    
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
    currentCycleStart = addDays(currentCycleStart, averageCycleLength);
  }
  
  return fertileDays;
};

// Helper function to find a specific cycle day
export const findCycleDay = (date: Date, cycles: Cycle[]): CycleDay | null => {
  for (const cycle of cycles) {
    const found = cycle.days.find(day => isSameDay(new Date(day.date), date));
    if (found) return found;
  }
  return null;
};

// Calculate average cycle and period length
export const calculateAverages = (cycles: Cycle[]) => {
  let averageCycleLength = DEFAULT_CYCLE_LENGTH;
  let averagePeriodLength = DEFAULT_CYCLE_LENGTH / 5;
  
  if (cycles.length > 1) {
    // Calculate average cycle length
    const cycleLengths = [];
    for (let i = 1; i < cycles.length; i++) {
      const current = cycles[i];
      const previous = cycles[i - 1];
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
    const periodLengths = cycles
      .filter(cycle => cycle.periodLength && cycle.periodLength > 0 && cycle.periodLength < 15)
      .map(cycle => cycle.periodLength as number);
      
    if (periodLengths.length > 0) {
      averagePeriodLength = Math.round(
        periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
      );
    }
  }

  return { averageCycleLength, averagePeriodLength };
};
