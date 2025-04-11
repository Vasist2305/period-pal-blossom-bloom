
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Constants for default values
const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

// Initialize user data with defaults
const initialUserData = {
  cycles: [],
  averageCycleLength: DEFAULT_CYCLE_LENGTH,
  averagePeriodLength: DEFAULT_PERIOD_LENGTH,
  lastUpdated: new Date(),
};

export const useCycleStorage = () => {
  const [userData, setUserData] = useState(initialUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate a local user ID if no authenticated user exists
  const getUserId = () => {
    if (user) return user.id;
    
    // Check if we have a local user ID
    let localUserId = localStorage.getItem('local_user_id');
    if (!localUserId) {
      // Generate a new local user ID
      localUserId = 'local_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('local_user_id', localUserId);
    }
    return localUserId;
  };

  // Fetch user data on mount and when user changes
  useEffect(() => {
    const userId = getUserId();
    
    const fetchData = async () => {
      setIsLoading(true);
      setDataError(null);
      
      try {
        const storedData = localStorage.getItem(`user_data_${userId}`);
        if (storedData) {
          setUserData(JSON.parse(storedData));
          console.log('Loaded data from localStorage');
        } else {
          console.info('No localStorage data found, using defaults');
          setUserData(initialUserData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setDataError(error);
        
        toast({
          title: "Using local data",
          description: "We're storing your cycle data locally in this browser.",
          variant: "default"
        });
        
        setUserData(initialUserData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Save data whenever it changes
  useEffect(() => {
    if (isLoading || dataError) return;
    
    const userId = getUserId();

    const saveData = async () => {
      try {
        localStorage.setItem(`user_data_${userId}`, JSON.stringify(userData));
        console.log('Saved data to localStorage');
      } catch (error) {
        console.error('Error saving user data:', error);
        
        toast({
          title: "Data saved locally",
          description: "Your cycle data has been saved to this browser",
          variant: "default"
        });
      }
    };
    
    saveData();
  }, [userData, isLoading, dataError, getUserId, toast]);

  // Reset all user data
  const resetData = async () => {
    const userId = getUserId();

    try {
      localStorage.removeItem(`user_data_${userId}`);
      
      setUserData(initialUserData);
      
      toast({
        title: "Data reset",
        description: "All your cycle data has been reset",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Error",
        description: "There was a problem resetting your data",
        variant: "destructive"
      });
    }
  };

  return {
    userData,
    setUserData,
    isLoading,
    getUserId,
    resetData
  };
};
