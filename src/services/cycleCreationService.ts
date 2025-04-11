
import { v4 as uuidv4 } from 'uuid';
import { Cycle } from '@/types';

// Create a new cycle entry
export const createCycle = (startDate: Date): Cycle => {
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
