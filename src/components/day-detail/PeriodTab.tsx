
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FLOW_TYPES } from '@/types';

interface PeriodTabProps {
  menstruation: boolean;
  flow: 'light' | 'medium' | 'heavy' | null;
  onChangeMenstruation: (checked: boolean) => void;
  onChangeFlow: (flow: 'light' | 'medium' | 'heavy') => void;
}

const PeriodTab: React.FC<PeriodTabProps> = ({ 
  menstruation, 
  flow, 
  onChangeMenstruation, 
  onChangeFlow 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="period-switch">Period Day</Label>
        <Switch 
          id="period-switch" 
          checked={menstruation} 
          onCheckedChange={onChangeMenstruation}
        />
      </div>
      
      {menstruation && (
        <div className="mt-4">
          <Label className="mb-2 block">Flow</Label>
          <div className="flex gap-2">
            {FLOW_TYPES.map(flowType => (
              <Button
                key={flowType.value}
                variant={flow === flowType.value ? "default" : "outline"}
                className={flow === flowType.value ? "" : flowType.color}
                onClick={() => onChangeFlow(flowType.value as 'light' | 'medium' | 'heavy')}
              >
                {flowType.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodTab;
