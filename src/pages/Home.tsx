
import React from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { CalendarDays, Droplets, LineChart, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCycleData } from '@/contexts/CycleContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const Home = () => {
  const { 
    userData, 
    currentCycle, 
    getOvulationDay, 
    addCycle, 
    isLoading 
  } = useCycleData();
  const navigate = useNavigate();
  
  const today = new Date();

  // Calculate the day of cycle
  const calculateCycleDay = () => {
    if (!currentCycle) return null;
    
    const startDate = new Date(currentCycle.startDate);
    const dayOfCycle = differenceInDays(today, startDate) + 1;
    
    return dayOfCycle > 0 ? dayOfCycle : null;
  };
  
  // Calculate days until next period
  const calculateDaysUntilNextPeriod = () => {
    if (!currentCycle) return null;
    
    const startDate = new Date(currentCycle.startDate);
    const predictedNextPeriod = addDays(startDate, userData.averageCycleLength);
    const daysUntil = differenceInDays(predictedNextPeriod, today);
    
    return daysUntil > 0 ? daysUntil : null;
  };
  
  // Get ovulation day
  const ovulationDay = currentCycle ? getOvulationDay(currentCycle.startDate) : null;
  
  // Calculate days until ovulation
  const calculateDaysUntilOvulation = () => {
    if (!ovulationDay) return null;
    
    const daysUntil = differenceInDays(ovulationDay, today);
    
    return daysUntil > 0 ? daysUntil : null;
  };
  
  // Calculate the cycle progress
  const calculateCycleProgress = () => {
    if (!currentCycle) return 0;
    
    const startDate = new Date(currentCycle.startDate);
    const dayOfCycle = differenceInDays(today, startDate) + 1;
    const progressPercentage = Math.min(100, (dayOfCycle / userData.averageCycleLength) * 100);
    
    return Math.max(0, progressPercentage);
  };
  
  // Handle starting a new period
  const handleStartPeriod = () => {
    addCycle(today);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Blossom & Bloom</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your data..." : "Track your cycle, understand your body"}
          </p>
        </section>
        
        {/* Cycle Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cycle Status</CardTitle>
            <CardDescription>
              {currentCycle 
                ? `Current cycle started on ${format(new Date(currentCycle.startDate), 'MMMM d')}`
                : "No active cycle"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentCycle ? (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Day {calculateCycleDay()} of {userData.averageCycleLength}</span>
                    <span className="text-sm text-muted-foreground">
                      {calculateDaysUntilNextPeriod() !== null 
                        ? `${calculateDaysUntilNextPeriod()} days until next period`
                        : "Period expected soon"
                      }
                    </span>
                  </div>
                  <Progress value={calculateCycleProgress()} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="rounded-lg bg-muted p-3 flex items-center space-x-3">
                    <Droplets className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Period Length</p>
                      <p className="text-sm text-muted-foreground">
                        {userData.averagePeriodLength} days
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-3 flex items-center space-x-3">
                    <CalendarClock className="h-5 w-5 text-lavender-500" />
                    <div>
                      <p className="text-sm font-medium">Ovulation</p>
                      <p className="text-sm text-muted-foreground">
                        {calculateDaysUntilOvulation() !== null 
                          ? `In ${calculateDaysUntilOvulation()} days`
                          : "Passed"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">Track your period to see predictions and insights</p>
                <Button onClick={handleStartPeriod}>Start Period Today</Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/calendar')}
          >
            <CalendarDays className="h-6 w-6" />
            <span>Calendar</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/stats')}
          >
            <LineChart className="h-6 w-6" />
            <span>Statistics</span>
          </Button>
        </div>
        
        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Tracking your period regularly helps identify patterns and can improve predictions.
              Make sure to log not just your period, but also symptoms and moods!
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
