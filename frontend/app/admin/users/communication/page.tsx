'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Mail, 
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { NotificationRecipients, UserRole, UserDepartment } from '@/types';
import { useSendNotification, useUsers } from '@/hooks/useUserManagement';

export default function CommunicationCenterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    recipients: {
      type: 'all' as 'all' | 'role' | 'department' | 'specific',
      role: '' as UserRole | '',
      department: '' as UserDepartment | '',
      userIds: [] as string[]
    },
    subject: '',
    message: '',
    type: 'email' as 'email' | 'sms'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { sendNotification, loading: sending, error: sendError } = useSendNotification();
  const { users } = useUsers({ limit: 1000 });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (formData.recipients.type === 'specific' && formData.recipients.userIds.length === 0) {
      newErrors.recipients = 'Please select at least one user';
    }

    if (formData.recipients.type === 'role' && !formData.recipients.role) {
      newErrors.recipients = 'Please select a role';
    }

    if (formData.recipients.type === 'department' && !formData.recipients.department) {
      newErrors.recipients = 'Please select a department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        userIds: checked 
          ? [...prev.recipients.userIds, userId]
          : prev.recipients.userIds.filter(id => id !== userId)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendNotification(formData);
      setSuccess(`Notification sent successfully! ${result.totalSent} sent, ${result.totalFailed} failed.`);
      setFormData({
        recipients: {
          type: 'all',
          role: '',
          department: '',
          userIds: []
        },
        subject: '',
        message: '',
        type: 'email'
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientCount = () => {
    switch (formData.recipients.type) {
      case 'all':
        return users.length;
      case 'role':
        return users.filter(user => user.role === formData.recipients.role).length;
      case 'department':
        return users.filter(user => user.department === formData.recipients.department).length;
      case 'specific':
        return formData.recipients.userIds.length;
      default:
        return 0;
    }
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'frontdesk', label: 'Front Desk' },
    { value: 'employee', label: 'Employee' },
    { value: 'guest', label: 'Guest' }
  ];

  const departmentOptions: { value: UserDepartment; label: string }[] = [
    { value: 'frontdesk', label: 'Front Desk' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'management', label: 'Management' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
        <p className="text-gray-600">Send notifications and messages to users</p>
      </div>

      {/* Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Send Notification
          </CardTitle>
          <CardDescription>
            Create and send notifications to selected users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <div className="text-red-800">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-green-800">{success}</div>
                </div>
              </div>
            )}

            {/* Recipients Selection */}
            <div className="space-y-4">
              <Label>Recipients</Label>
              <RadioGroup
                value={formData.recipients.type}
                onValueChange={(value) => handleInputChange('recipients.type', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    All Users ({users.length})
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="role" id="role" />
                  <Label htmlFor="role" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    By Role
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="department" id="department" />
                  <Label htmlFor="department" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    By Department
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Specific Users
                  </Label>
                </div>
              </RadioGroup>

              {formData.recipients.type === 'role' && (
                <div>
                  <Label htmlFor="role-select">Select Role</Label>
                  <Select 
                    value={formData.recipients.role} 
                    onValueChange={(value) => handleInputChange('recipients.role', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recipients && (
                    <p className="text-red-500 text-sm mt-1">{errors.recipients}</p>
                  )}
                </div>
              )}

              {formData.recipients.type === 'department' && (
                <div>
                  <Label htmlFor="department-select">Select Department</Label>
                  <Select 
                    value={formData.recipients.department} 
                    onValueChange={(value) => handleInputChange('recipients.department', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recipients && (
                    <p className="text-red-500 text-sm mt-1">{errors.recipients}</p>
                  )}
                </div>
              )}

              {formData.recipients.type === 'specific' && (
                <div>
                  <Label>Select Users</Label>
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-4">
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center space-x-2 py-2">
                        <input
                          type="checkbox"
                          id={`user-${user._id}`}
                          checked={formData.recipients.userIds.includes(user._id)}
                          onChange={(e) => handleUserSelection(user._id, e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`user-${user._id}`} className="flex-1">
                          {user.firstName} {user.lastName} ({user.email}) - {user.role}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.recipients && (
                    <p className="text-red-500 text-sm mt-1">{errors.recipients}</p>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-600">
                <strong>Recipients:</strong> {getRecipientCount()} users will receive this notification
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <Label>Notification Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    SMS (Coming Soon)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={errors.subject ? 'border-red-500' : ''}
                placeholder="Enter notification subject"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={errors.message ? 'border-red-500' : ''}
                placeholder="Enter your message here..."
                rows={6}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                You can use HTML formatting in your message
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={loading || sending}
                className="min-w-32"
              >
                {loading || sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Pre-defined message templates for common notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold text-gray-900">Welcome Message</h3>
              <p className="text-sm text-gray-600 mt-1">Welcome new users to the system</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    subject: 'Welcome to HMS!',
                    message: '<h2>Welcome to our Hotel Management System!</h2><p>We are excited to have you on board. Please explore the system and let us know if you have any questions.</p><p>Best regards,<br>The HMS Team</p>'
                  }));
                }}
              >
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold text-gray-900">System Maintenance</h3>
              <p className="text-sm text-gray-600 mt-1">Notify about scheduled maintenance</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    subject: 'Scheduled System Maintenance',
                    message: '<h2>System Maintenance Notice</h2><p>We will be performing scheduled maintenance on our system. During this time, some features may be temporarily unavailable.</p><p>Thank you for your understanding.</p>'
                  }));
                }}
              >
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold text-gray-900">Password Reset</h3>
              <p className="text-sm text-gray-600 mt-1">Guide users through password reset</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    subject: 'Password Reset Instructions',
                    message: '<h2>Password Reset</h2><p>If you need to reset your password, please follow these steps:</p><ol><li>Go to the login page</li><li>Click "Forgot Password"</li><li>Enter your email address</li><li>Check your email for reset instructions</li></ol>'
                  }));
                }}
              >
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
