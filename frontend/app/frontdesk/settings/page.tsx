'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    desktop: true,
    newReservations: true,
    checkInReminders: true,
    paymentAlerts: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save notification preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Notification preferences saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#006bb8]">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                <p className="text-sm text-gray-500">Show browser notifications</p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={notifications.desktop}
                onCheckedChange={(checked) => handleNotificationChange('desktop', checked)}
              />
            </div>
          </div>

          <hr />

          <div className="space-y-4">
            <h3 className="font-medium">Notification Types</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-reservations">New Reservations</Label>
                <p className="text-sm text-gray-500">Get notified when new reservations are made</p>
              </div>
              <Switch
                id="new-reservations"
                checked={notifications.newReservations}
                onCheckedChange={(checked) => handleNotificationChange('newReservations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="checkin-reminders">Check-in Reminders</Label>
                <p className="text-sm text-gray-500">Reminders for upcoming check-ins</p>
              </div>
              <Switch
                id="checkin-reminders"
                checked={notifications.checkInReminders}
                onCheckedChange={(checked) => handleNotificationChange('checkInReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-alerts">Payment Alerts</Label>
                <p className="text-sm text-gray-500">Alerts for pending or overdue payments</p>
              </div>
              <Switch
                id="payment-alerts"
                checked={notifications.paymentAlerts}
                onCheckedChange={(checked) => handleNotificationChange('paymentAlerts', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveNotifications}
              disabled={loading}
              className="bg-[#006bb8] hover:bg-[#006bb8]/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={loading}
                className="bg-[#006bb8] hover:bg-[#006bb8]/90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Settings className="w-5 h-5 mr-2" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Account Status</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Last Login</h3>
              <p className="text-sm text-gray-600">Today at 9:30 AM</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Session Information</h3>
              <p className="text-sm text-gray-600">Browser: Chrome 120.0.0.0</p>
              <p className="text-sm text-gray-600">IP Address: 192.168.1.100</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
