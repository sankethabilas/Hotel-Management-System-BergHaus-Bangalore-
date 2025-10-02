'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignIn from '@/components/auth/SignIn';
import SignUp from '@/components/auth/SignUp';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signup');

  return (
    <div className="min-h-screen bg-gradient-to-br from-hms-highlight via-white to-hms-accent/20">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md mx-auto w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-hms-primary data-[state=active]:text-white transition-all duration-200 font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-hms-primary data-[state=active]:text-white transition-all duration-200 font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-0">
              <SignIn />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <SignUp />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
