import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Droplets, ThermometerSun } from 'lucide-react';
import { useCycleContext } from '@/contexts/CycleContext';
import { format, addDays } from 'date-fns';

const Home = () => {
  const { currentCycle, getPredictedPeriodDays, getFertileWindowDays, getOvulationDay } = useCycleContext();
  
  const today = new Date();
  const nextMonth = addDays(today, 30);
  
  const periodDays = getPredictedPeriodDays(today, nextMonth);
  const fertileWindowDays = getFertileWindowDays(today, nextMonth);
  const ovulationDay = currentCycle ? getOvulationDay(currentCycle.startDate) : null;
  
  const nextPeriod = periodDays.length > 0 ? periodDays[0] : null;
  const daysUntilNextPeriod = nextPeriod 
    ? Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) 
    : null;
  
  const nextFertileDay = fertileWindowDays.length > 0 ? fertileWindowDays[0] : null;
  const daysUntilFertile = nextFertileDay 
    ? Math.ceil((nextFertileDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) 
    : null;

  return (
    <Layout>
      <div className="space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mt-4">Welcome to Her Cycle Diary</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-primary" />
              Period Prediction
            </CardTitle>
            <CardDescription>Your upcoming period</CardDescription>
          </CardHeader>
          <CardContent>
            {nextPeriod ? (
              <div>
                <p className="text-lg font-medium">
                  {daysUntilNextPeriod === 0 
                    ? "Your period is predicted to start today" 
                    : `Your next period is predicted to start in ${daysUntilNextPeriod} days`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(nextPeriod, 'MMMM d, yyyy')}
                </p>
              </div>
            ) : (
              <p>Start tracking your cycle to see period predictions</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ThermometerSun className="w-5 h-5 mr-2 text-lavender-500" />
              Fertility Window
            </CardTitle>
            <CardDescription>Your upcoming fertile days</CardDescription>
          </CardHeader>
          <CardContent>
            {nextFertileDay ? (
              <div>
                <p className="text-lg font-medium">
                  {daysUntilFertile === 0 
                    ? "Your fertile window starts today" 
                    : daysUntilFertile < 0
                      ? "You are currently in your fertile window"
                      : `Your fertile window starts in ${daysUntilFertile} days`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(nextFertileDay, 'MMMM d, yyyy')}
                </p>
              </div>
            ) : (
              <p>Start tracking your cycle to see fertility predictions</p>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <Button className="w-full" size="lg">
            <Calendar className="w-4 h-4 mr-2" />
            Track Today
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
