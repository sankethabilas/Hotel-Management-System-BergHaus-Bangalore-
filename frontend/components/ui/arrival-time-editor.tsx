'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Save, X } from 'lucide-react';

interface ArrivalTimeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentArrivalTime?: string;
  onSave: (arrivalTime: string) => void;
  isLoading?: boolean;
}

export function ArrivalTimeEditor({
  open,
  onOpenChange,
  currentArrivalTime = '',
  onSave,
  isLoading = false
}: ArrivalTimeEditorProps) {
  const [arrivalTime, setArrivalTime] = useState(currentArrivalTime);

  React.useEffect(() => {
    setArrivalTime(currentArrivalTime);
  }, [currentArrivalTime]);

  const handleSave = () => {
    if (arrivalTime.trim()) {
      onSave(arrivalTime.trim());
    }
  };

  const handleCancel = () => {
    setArrivalTime(currentArrivalTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-hms-primary" />
            <span>Edit Arrival Time</span>
          </DialogTitle>
          <DialogDescription>
            Update your expected arrival time for this booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="arrivalTime" className="text-sm font-medium">
              Expected Arrival Time
            </Label>
            <Input
              id="arrivalTime"
              type="text"
              placeholder="e.g., 2:00 PM, 14:30, Evening"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can enter time in any format (e.g., "2:00 PM", "14:30", "Evening")
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !arrivalTime.trim()}
            className="w-full sm:w-auto bg-hms-primary hover:bg-hms-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
