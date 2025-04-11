
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { SYMPTOMS } from '@/types';

interface SymptomsTabProps {
  symptoms: string[];
  onAddSymptom: (symptom: string) => void;
  onRemoveSymptom: (symptom: string) => void;
}

const SymptomsTab: React.FC<SymptomsTabProps> = ({ 
  symptoms, 
  onAddSymptom, 
  onRemoveSymptom 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Current Symptoms</Label>
        <div className="flex flex-wrap gap-2 min-h-10">
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No symptoms recorded</p>
          ) : (
            symptoms.map(symptom => (
              <Badge key={symptom} variant="secondary" className="pl-2 flex items-center">
                {symptom}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-1 hover:bg-transparent" 
                  onClick={() => onRemoveSymptom(symptom)}
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
              onClick={() => onAddSymptom(symptom)}
              disabled={symptoms.includes(symptom)}
            >
              {symptom}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SymptomsTab;
