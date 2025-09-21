'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginPage from './login/page';
import SignupPage from './signup/page';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signup');

  return (
    <div className="min-h-screen bg-gradient-to-br from-hms-highlight via-white to-hms-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 backdrop-blur-sm">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-hms-primary data-[state=active]:text-white transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-hms-primary data-[state=active]:text-white transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <LoginPage />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <SignupPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
