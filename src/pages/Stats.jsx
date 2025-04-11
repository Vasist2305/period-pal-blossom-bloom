
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Layout from '@/components/Layout';
import { useCycleData } from '@/contexts/CycleContext';

const StatsPage = () => {
  const { userData, isLoading } = useCycleData();
  
  // Convert cycle data for cycle length chart
  const cycleLengthData = userData.cycles
    .filter(cycle => cycle.length)
    .slice(-6)
    .map(cycle => ({
      date: format(new Date(cycle.startDate), 'MMM d'),
      length: cycle.length
    }));
  
  // Convert period data for period length chart
  const periodLengthData = userData.cycles
    .filter(cycle => cycle.periodLength)
    .slice(-6)
    .map(cycle => ({
      date: format(new Date(cycle.startDate), 'MMM d'),
      length: cycle.periodLength
    }));

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4">Cycle Statistics</h1>
        
        {isLoading ? (
          <div className="text-center py-8">Loading your statistics...</div>
        ) : (
          <>
            {/* Cycle Averages */}
            <Card>
              <CardHeader>
                <CardTitle>Your Averages</CardTitle>
                <CardDescription>Based on your tracking history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Cycle Length</p>
                    <p className="text-3xl font-bold">{userData.averageCycleLength}</p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Period Length</p>
                    <p className="text-3xl font-bold">{userData.averagePeriodLength}</p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Cycle Length Chart */}
            {cycleLengthData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cycle Length History</CardTitle>
                  <CardDescription>Your last {cycleLengthData.length} cycles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cycleLengthData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 'dataMax + 5']} />
                        <Tooltip 
                          formatter={(value) => [`${value} days`, 'Length']}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Bar dataKey="length" fill="#FF5A70" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Period Length Chart */}
            {periodLengthData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Period Length History</CardTitle>
                  <CardDescription>Your last {periodLengthData.length} periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={periodLengthData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 'dataMax + 2']} />
                        <Tooltip 
                          formatter={(value) => [`${value} days`, 'Length']}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <Bar dataKey="length" fill="#8466FF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {userData.cycles.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Start tracking your cycles to see statistics here
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default StatsPage;
