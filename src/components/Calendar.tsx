
import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCycleData } from '@/contexts/CycleContext';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getCycleDay, getPredictedPeriodDays, getFertileWindowDays, getOvulationDay } = useCycleData();

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get all days that need to be displayed in the calendar grid
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Get predicted period, fertile window, and ovulation days
  const predictedPeriodDays = getPredictedPeriodDays(startDate, endDate);
  const fertileWindowDays = getFertileWindowDays(startDate, endDate);
  const ovulationDay = monthStart ? getOvulationDay(monthStart) : null;

  // Day names for headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8 rounded-full p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>
        
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8 rounded-full p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      {/* Day names row */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(day => {
          // Check day status
          const cycleDay = getCycleDay(day);
          const isPeriod = cycleDay?.menstruation;
          const isPredictedPeriod = !isPeriod && predictedPeriodDays.some(d => isSameDay(d, day));
          const isFertile = fertileWindowDays.some(d => isSameDay(d, day));
          const isOvulation = ovulationDay && isSameDay(ovulationDay, day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "calendar-day",
                !isCurrentMonth && "text-muted-foreground opacity-40",
                isPeriod && "period",
                isPredictedPeriod && "period opacity-50",
                isFertile && !isPeriod && !isPredictedPeriod && "fertile",
                isOvulation && !isPeriod && !isPredictedPeriod && "ovulation",
                isToday(day) && "today"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Calendar legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blossom-500 mr-2"></div>
          <span>Period</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blossom-500 opacity-50 mr-2"></div>
          <span>Predicted Period</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-lavender-100 mr-2"></div>
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-lavender-400 mr-2"></div>
          <span>Ovulation</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
