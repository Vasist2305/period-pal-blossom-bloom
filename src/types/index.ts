
export interface CycleDay {
  date: Date;
  menstruation: boolean;
  flow?: 'light' | 'medium' | 'heavy' | null;
  mood?: 'happy' | 'neutral' | 'sad' | 'sensitive' | 'irritated' | null;
  symptoms?: string[];
  notes?: string;
}

export interface Cycle {
  id: string;
  startDate: Date;
  endDate?: Date;
  days: CycleDay[];
  length?: number;
  periodLength?: number;
}

export interface UserData {
  cycles: Cycle[];
  averageCycleLength: number;
  averagePeriodLength: number;
  lastUpdated: Date;
}

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const SYMPTOMS = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'backache',
  'tender breasts',
  'acne',
  'insomnia',
  'nausea',
  'cravings'
];

export const MOODS = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'sad', label: 'Sad', icon: '😔' },
  { value: 'sensitive', label: 'Sensitive', icon: '🥺' },
  { value: 'irritated', label: 'Irritated', icon: '😠' }
];

export const FLOW_TYPES = [
  { value: 'light', label: 'Light', color: 'bg-blossom-300' },
  { value: 'medium', label: 'Medium', color: 'bg-blossom-500' },
  { value: 'heavy', label: 'Heavy', color: 'bg-blossom-700' }
];
