
import { isSameDay } from 'date-fns';
import {
  calculateOvulationDay,
  calculatePredictedPeriodDays,
  calculateFertileWindowDays,
  findCycleDay
} from '@/utils/cycleCalculations';

export const useCycleHelpers = (cycles, averageCycleLength, averagePeriodLength) => {
  // Get the current cycle
  const currentCycle = cycles.length > 0 
    ? cycles.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0] 
    : null;

  // Get a specific cycle day
  const getCycleDay = (date) => {
    return findCycleDay(date, cycles);
  };

  // Get predicted period days
  const getPredictedPeriodDays = (startDate, endDate) => {
    return calculatePredictedPeriodDays(
      startDate, 
      endDate, 
      cycles, 
      averageCycleLength,
      averagePeriodLength
    );
  };

  // Get fertile window days
  const getFertileWindowDays = (startDate, endDate) => {
    return calculateFertileWindowDays(
      startDate, 
      endDate, 
      cycles,
      averageCycleLength
    );
  };

  // Get ovulation day
  const getOvulationDay = (cycleStartDate) => {
    return calculateOvulationDay(cycleStartDate, averageCycleLength);
  };

  return {
    currentCycle,
    getCycleDay,
    getPredictedPeriodDays,
    getFertileWindowDays,
    getOvulationDay
  };
};
