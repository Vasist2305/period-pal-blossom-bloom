
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Calendar from '@/components/Calendar';
import DayDetail from '@/components/DayDetail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCycleData } from '@/contexts/CycleContext';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isLoading } = useCycleData();
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleCloseDetail = () => {
    setSelectedDate(null);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4">Cycle Calendar</h1>
        
        {isLoading ? (
          <div className="text-center py-8">Loading your calendar...</div>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="pb-6">
              <Calendar onDateSelect={handleDateSelect} />
              
              {selectedDate && (
                <div className="mt-6">
                  <DayDetail date={selectedDate} onClose={handleCloseDetail} />
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </Layout>
  );
};

export default CalendarPage;
