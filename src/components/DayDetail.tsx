
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useCycleData } from '@/contexts/CycleContext';
import { CycleDay, MOODS, SYMPTOMS, FLOW_TYPES } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ date, onClose }) => {
  const { getCycleDay, updateCycleDay } = useCycleData();
  const existingData = getCycleDay(date) || {
    date,
    menstruation: false,
    symptoms: []
  };
  
  const [dayData, setDayData] = useState<CycleDay>(existingData);
  
  // Update local state when existing data changes
  useEffect(() => {
    if (existingData) {
      setDayData(existingData);
    }
  }, [existingData]);
  
  const handleChangeMenstruation = (checked: boolean) => {
    const newData = { ...dayData, menstruation: checked };
    if (!checked) {
      newData.flow = null;
    } else if (!newData.flow) {
      newData.flow = 'medium';
    }
    setDayData(newData);
    updateCycleDay(date, { menstruation: checked, flow: newData.flow });
  };
  
  const handleChangeFlow = (flow: 'light' | 'medium' | 'heavy') => {
    setDayData({ ...dayData, flow });
    updateCycleDay(date, { flow });
  };
  
  const handleChangeMood = (mood: 'happy' | 'neutral' | 'sad' | 'sensitive' | 'irritated' | null) => {
    setDayData({ ...dayData, mood });
    updateCycleDay(date, { mood });
  };
  
  const handleAddSymptom = (symptom: string) => {
    const symptoms = [...(dayData.symptoms || [])];
    if (!symptoms.includes(symptom)) {
      const updatedSymptoms = [...symptoms, symptom];
      setDayData({ ...dayData, symptoms: updatedSymptoms });
      updateCycleDay(date, { symptoms: updatedSymptoms });
    }
  };
  
  const handleRemoveSymptom = (symptom: string) => {
    const symptoms = [...(dayData.symptoms || [])];
    const updatedSymptoms = symptoms.filter(s => s !== symptom);
    setDayData({ ...dayData, symptoms: updatedSymptoms });
    updateCycleDay(date, { symptoms: updatedSymptoms });
  };
  
  const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
          
          <TabsContent value="period" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="period-switch">Period Day</Label>
              <Switch 
                id="period-switch" 
                checked={dayData.menstruation} 
                onCheckedChange={handleChangeMenstruation}
              />
            </div>
            
            {dayData.menstruation && (
              <div className="mt-4">
                <Label className="mb-2 block">Flow</Label>
                <div className="flex gap-2">
                  {FLOW_TYPES.map(flow => (
                    <Button
                      key={flow.value}
                      variant={dayData.flow === flow.value ? "default" : "outline"}
                      className={dayData.flow === flow.value ? "" : flow.color}
                      onClick={() => handleChangeFlow(flow.value as 'light' | 'medium' | 'heavy')}
                    >
                      {flow.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mood">
            <Label className="mb-2 block">How are you feeling today?</Label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map(mood => (
                <Button
                  key={mood.value}
                  variant={dayData.mood === mood.value ? "default" : "outline"}
                  className="flex flex-col h-auto py-3"
                  onClick={() => handleChangeMood(mood.value as any)}
                >
                  <span className="text-xl mb-1">{mood.icon}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="symptoms">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Current Symptoms</Label>
                <div className="flex flex-wrap gap-2 min-h-10">
                  {(dayData.symptoms || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No symptoms recorded</p>
                  ) : (
                    (dayData.symptoms || []).map(symptom => (
                      <Badge key={symptom} variant="secondary" className="pl-2 flex items-center">
                        {symptom}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 ml-1 hover:bg-transparent" 
                          onClick={() => handleRemoveSymptom(symptom)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Add Symptoms</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SYMPTOMS.map(symptom => (
                    <Button
                      key={symptom}
                      variant="outline"
                      className="justify-start text-sm"
                      onClick={() => handleAddSymptom(symptom)}
                      disabled={(dayData.symptoms || []).includes(symptom)}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes">
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes for this day</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Write any notes about today..."
                  className="mt-2"
                  value={dayData.notes || ''}
                  onChange={handleChangeNotes}
                  rows={5}
                />
                <Button className="mt-4" onClick={handleSaveNotes}>Save Notes</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DayDetail;
