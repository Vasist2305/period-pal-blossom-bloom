
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MOODS } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface MoodTabProps {
  mood: 'happy' | 'neutral' | 'sad' | 'sensitive' | 'irritated' | null;
  onChangeMood: (mood: 'happy' | 'neutral' | 'sad' | 'sensitive' | 'irritated' | null) => void;
}

const MoodTab: React.FC<MoodTabProps> = ({ mood, onChangeMood }) => {
  const { toast } = useToast();
  
  const handleMoodChange = (newMood: 'happy' | 'neutral' | 'sad' | 'sensitive' | 'irritated' | null) => {
    onChangeMood(newMood);
    
    toast({
      title: "Mood updated",
      description: `Your mood has been saved as "${newMood || 'none'}"`,
    });
  };
  
  return (
    <div>
      <Label className="mb-2 block">How are you feeling today?</Label>
      <div className="grid grid-cols-5 gap-2">
        {MOODS.map(moodItem => (
          <Button
            key={moodItem.value}
            variant={mood === moodItem.value ? "default" : "outline"}
            className="flex flex-col h-auto py-3"
            onClick={() => handleMoodChange(moodItem.value as any)}
          >
            <span className="text-xl mb-1">{moodItem.icon}</span>
            <span className="text-xs">{moodItem.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodTab;
