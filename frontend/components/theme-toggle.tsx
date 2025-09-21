'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    switch (resolvedTheme) {
      case 'light':
        return <Sun className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />;
      case 'dark':
        return <Moon className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />;
      default:
        return <Monitor className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 px-0 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`flex items-center ${theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`flex items-center ${theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`flex items-center ${theme === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
