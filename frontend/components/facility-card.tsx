'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Utensils, 
  Waves, 
  Sparkles, 
  Dumbbell, 
  Car, 
  Wifi,
  Coffee,
  Shield,
  UserCheck,
  Plane
} from 'lucide-react';

interface FacilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isAvailable: boolean;
}

const iconMap = {
  restaurant: <Utensils className="w-8 h-8" />,
  pool: <Waves className="w-8 h-8" />,
  spa: <Sparkles className="w-8 h-8" />,
  gym: <Dumbbell className="w-8 h-8" />,
  parking: <Car className="w-8 h-8" />,
  wifi: <Wifi className="w-8 h-8" />,
  coffee: <Coffee className="w-8 h-8" />,
  security: <Shield className="w-8 h-8" />,
  concierge: <UserCheck className="w-8 h-8" />,
  airport: <Plane className="w-8 h-8" />
};

export default function FacilityCard({ icon, title, description, isAvailable }: FacilityCardProps) {
  return (
    <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-300 ${
            isAvailable 
              ? 'bg-hms-primary/10 text-hms-primary group-hover:bg-hms-primary group-hover:text-white' 
              : 'bg-gray-100 text-gray-400'
          }`}>
            {icon}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            isAvailable ? 'text-hms-primary group-hover:text-hms-secondary' : 'text-gray-400'
          }`}>
            {title}
          </h3>

          {/* Description */}
          <p className={`text-sm leading-relaxed transition-colors duration-300 ${
            isAvailable ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {description}
          </p>

          {/* Status Badge */}
          <div className="pt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isAvailable 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {isAvailable ? 'Available' : 'Coming Soon'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export the icon map for easy use
export { iconMap };
