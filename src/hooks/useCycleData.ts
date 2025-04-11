
import { useCycleStorage } from './useCycleStorage';
import { useCycleActions } from './useCycleActions';
import { useCycleHelpers } from './useCycleHelpers';

export const useCycleData = () => {
  const { 
    userData, 
    setUserData, 
    isLoading, 
    getUserId, 
    resetData 
  } = useCycleStorage();

  const { 
    addCycle, 
    updateCycleDay 
  } = useCycleActions(userData, setUserData, getUserId);

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

  return {
    userData,
    isLoading,
    currentCycle,
    addCycle,
    updateCycleDay,
    getCycleDay,
    getPredictedPeriodDays,
    getFertileWindowDays,
    getOvulationDay,
    resetData
  };
};
