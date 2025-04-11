
import { 
  addDays, 
  isSameDay, 
  differenceInDays, 
  isBefore, 
  isAfter,
  subDays
} from 'date-fns';

// Find a cycle day by date
export const findCycleDay = (date, cycles) => {
  for (const cycle of cycles) {
    const matchingDay = cycle.days.find(day => 
      isSameDay(new Date(day.date), new Date(date))
    );
    if (matchingDay) {
      return { 
        ...matchingDay, 
        date: new Date(matchingDay.date) 
      };
    }
  }
  return null;
};

// Calculate the average cycle and period length
export const calculateAverages = (cycles) => {
  if (cycles.length <= 1) {
    return {
      averageCycleLength: 28, // Default cycle length
      averagePeriodLength: 5  // Default period length
    };
  }

  // Calculate average cycle length
  let totalCycleLength = 0;
  let cycleCount = 0;

  for (let i = 1; i < cycles.length; i++) {
    const currentStartDate = new Date(cycles[i].startDate);
    const prevStartDate = new Date(cycles[i-1].startDate);
    
    if (isBefore(prevStartDate, currentStartDate)) {
      const cycleLength = differenceInDays(currentStartDate, prevStartDate);
      if (cycleLength > 0 && cycleLength < 90) { // Ignore outliers
        totalCycleLength += cycleLength;
        cycleCount++;
      }
    }
  }

  // Calculate average period length
  let totalPeriodLength = 0;
  let periodCount = 0;

  for (const cycle of cycles) {
    if (cycle.periodLength && cycle.periodLength > 0) {
      totalPeriodLength += cycle.periodLength;
      periodCount++;
    }
  }

  return {
    averageCycleLength: cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28,
    averagePeriodLength: periodCount > 0 ? Math.round(totalPeriodLength / periodCount) : 5
  };
};

// Calculate predicted period days
export const calculatePredictedPeriodDays = (
  startDate, 
  endDate, 
  cycles, 
  averageCycleLength = 28,
  averagePeriodLength = 5
) => {
  const predictedDays = [];
  
  // If no cycles yet, return empty array
  if (cycles.length === 0) {
    return predictedDays;
  }

  // Sort cycles by start date (newest first)
  const sortedCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  
  // Get most recent cycle
  const latestCycle = sortedCycles[0];
  const latestCycleStartDate = new Date(latestCycle.startDate);
  
  // Generate predicted period days
  let predictedStartDate;
  
  // Start from latest cycle start date
  predictedStartDate = addDays(latestCycleStartDate, averageCycleLength);
  
  // Add predicted periods until we pass the end date
  while (isBefore(predictedStartDate, endDate)) {
    if (isAfter(predictedStartDate, startDate)) {
      // Add each day of the predicted period
      for (let i = 0; i < averagePeriodLength; i++) {
        const periodDay = addDays(predictedStartDate, i);
        if (isBefore(periodDay, endDate) && isAfter(periodDay, startDate)) {
          predictedDays.push(periodDay);
        }
      }
    }
    
    // Move to next predicted period
    predictedStartDate = addDays(predictedStartDate, averageCycleLength);
  }
  
  return predictedDays;
};

// Calculate fertile window (typically 5 days before ovulation and ovulation day)
export const calculateFertileWindowDays = (
  startDate, 
  endDate, 
  cycles,
  averageCycleLength = 28
) => {
  const fertileWindowDays = [];
  
  // If no cycles yet, return empty array
  if (cycles.length === 0) {
    return fertileWindowDays;
  }

  // Sort cycles by start date (newest first)
  const sortedCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  
  // Get most recent cycle
  const latestCycle = sortedCycles[0];
  const latestCycleStartDate = new Date(latestCycle.startDate);
  
  // Generate fertile windows for upcoming cycles
  let nextCycleStart = latestCycleStartDate;
  
  while (isBefore(nextCycleStart, endDate)) {
    const ovulationDay = calculateOvulationDay(nextCycleStart, averageCycleLength);
    
    if (ovulationDay) {
      // Fertile window is typically 5 days before ovulation and includes ovulation day
      for (let i = -5; i <= 0; i++) {
        const fertileDay = addDays(ovulationDay, i);
        if (isBefore(fertileDay, endDate) && isAfter(fertileDay, startDate)) {
          fertileWindowDays.push(fertileDay);
        }
      }
    }
    
    // Move to next cycle
    nextCycleStart = addDays(nextCycleStart, averageCycleLength);
  }
  
  return fertileWindowDays;
};

// Calculate ovulation day (typically 14 days before next period)
export const calculateOvulationDay = (cycleStartDate, averageCycleLength = 28) => {
  if (!cycleStartDate) return null;
  
  // Ovulation typically occurs around 14 days before the next period
  const daysFromCycleStart = averageCycleLength - 14;
  return addDays(new Date(cycleStartDate), daysFromCycleStart);
};
