import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Gift, Star, Sparkles } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  rewardName: string;
  pointsCost: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  rewardName,
  pointsCost,
  icon,
  loading = false
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {/* Icon Section */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full animate-ping opacity-75"></div>
              </div>
              
              {/* Main icon */}
              <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-hms-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                {icon || <Gift className="w-10 h-10 text-white" />}
              </div>
              
              {/* Sparkle decorations */}
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-bounce" />
              <Star className="absolute -bottom-1 -left-1 w-5 h-5 text-yellow-500 animate-pulse fill-yellow-400" />
            </div>
          </div>

          <AlertDialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-hms-primary to-purple-600 bg-clip-text text-transparent">
            {title}
          </AlertDialogTitle>
          
          <AlertDialogDescription asChild>
            <div className="text-center space-y-4 pt-4">
              {/* Reward Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Reward:</span>
                  <span className="text-lg font-bold text-gray-900">{rewardName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Points Cost:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    <span className="text-xl font-bold text-hms-primary">
                      {pointsCost.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-gray-600 text-base leading-relaxed">
                {description}
              </div>

              {/* Info message */}
              <div className="flex items-start space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                </div>
                <div className="text-xs text-blue-800 text-left">
                  Your points will be deducted immediately and you'll receive confirmation details via email.
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            disabled={loading}
            className="w-full sm:w-auto border-2 hover:bg-gray-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-hms-primary to-purple-600 hover:from-hms-primary/90 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Redeeming...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>Yes, Redeem Now!</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
