'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Filter, TrendingUp, Users, Gift, MessageSquare } from 'lucide-react';
import LoyaltyReportSection from '@/components/crm/LoyaltyReportSection';
import FeedbackReportSection from '@/components/crm/FeedbackReportSection';
import OffersReportSection from '@/components/crm/OffersReportSection';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('loyalty');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CRM Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate filtered reports and export data for Customer Relationship Management
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Loyalty & Points</p>
                  <h3 className="text-2xl font-bold mt-1">Members Data</h3>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Feedback</p>
                  <h3 className="text-2xl font-bold mt-1">Guest Reviews</h3>
                </div>
                <MessageSquare className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Offers</p>
                  <h3 className="text-2xl font-bold mt-1">Promotions</h3>
                </div>
                <Gift className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="loyalty" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Loyalty & Points
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="offers" className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Offers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="loyalty">
                <LoyaltyReportSection />
              </TabsContent>

              <TabsContent value="feedback">
                <FeedbackReportSection />
              </TabsContent>

              <TabsContent value="offers">
                <OffersReportSection />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

