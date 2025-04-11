
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useCycleData } from '@/contexts/CycleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';

// Import the tab components
import PeriodTab from './day-detail/PeriodTab';
import MoodTab from './day-detail/MoodTab';
import SymptomsTab from './day-detail/SymptomsTab';
import NotesTab from './day-detail/NotesTab';

const DayDetail = ({ date, onClose }) => {
  const { getCycleDay, updateCycleDay } = useCycleData();
  const existingData = getCycleDay(date) || {
    date,
    menstruation: false,
    symptoms: []
  };
  
  const [dayData, setDayData] = useState(existingData);
  
  // Update local state when existing data changes
  useEffect(() => {
    if (existingData) {
      setDayData(existingData);
    }
  }, [existingData]);
  
  const handleChangeMenstruation = (checked) => {
    const newData = { ...dayData, menstruation: checked };
    if (!checked) {
      newData.flow = null;
    } else if (!newData.flow) {
      newData.flow = 'medium';
    }
    setDayData(newData);
    updateCycleDay(date, { menstruation: checked, flow: newData.flow });
  };
  
  const handleChangeFlow = (flow) => {
    setDayData({ ...dayData, flow });
    updateCycleDay(date, { flow });
  };
  
  const handleChangeMood = (mood) => {
    setDayData({ ...dayData, mood });
    updateCycleDay(date, { mood });
  };
  
  const handleAddSymptom = (symptom) => {
    const symptoms = [...(dayData.symptoms || [])];
    if (!symptoms.includes(symptom)) {
      const updatedSymptoms = [...symptoms, symptom];
      setDayData({ ...dayData, symptoms: updatedSymptoms });
      updateCycleDay(date, { symptoms: updatedSymptoms });
    }
  };
  
  const handleRemoveSymptom = (symptom) => {
    const symptoms = [...(dayData.symptoms || [])];
    const updatedSymptoms = symptoms.filter(s => s !== symptom);
    setDayData({ ...dayData, symptoms: updatedSymptoms });
    updateCycleDay(date, { symptoms: updatedSymptoms });
  };
  
  const handleChangeNotes = (e) => {
    setDayData({ ...dayData, notes: e.target.value });
  };
  
  const handleSaveNotes = () => {
    updateCycleDay(date, { notes: dayData.notes });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{format(date, 'EEEE')}</CardTitle>
            <CardDescription>{format(date, 'MMMM d, yyyy')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="period">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="period">Period</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="period">
            <PeriodTab 
              menstruation={dayData.menstruation} 
              flow={dayData.flow} 
              onChangeMenstruation={handleChangeMenstruation}
              onChangeFlow={handleChangeFlow}
            />
          </TabsContent>
          
          <TabsContent value="mood">
            <MoodTab 
              mood={dayData.mood} 
              onChangeMood={handleChangeMood} 
            />
          </TabsContent>
          
          <TabsContent value="symptoms">
            <SymptomsTab 
              symptoms={dayData.symptoms || []}
              onAddSymptom={handleAddSymptom}
              onRemoveSymptom={handleRemoveSymptom}
            />
          </TabsContent>
          
          <TabsContent value="notes">
            <NotesTab 
              notes={dayData.notes}
              onChange={handleChangeNotes}
              onSave={handleSaveNotes}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DayDetail;
