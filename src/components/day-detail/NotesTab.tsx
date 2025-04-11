
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface NotesTabProps {
  notes: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ notes, onChange, onSave }) => {
  const { toast } = useToast();
  
  const handleSave = () => {
    onSave();
    toast({
      title: "Notes saved",
      description: "Your notes have been saved successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="notes">Notes for this day</Label>
        <Textarea 
          id="notes" 
          placeholder="Write any notes about today..."
          className="mt-2"
          value={notes || ''}
          onChange={onChange}
          rows={5}
        />
        <Button className="mt-4" onClick={handleSave}>Save Notes</Button>
      </div>
    </div>
  );
};

export default NotesTab;
