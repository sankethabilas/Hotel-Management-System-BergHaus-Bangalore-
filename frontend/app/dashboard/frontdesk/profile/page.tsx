'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Save, 
  Edit3,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowLeft,
  Building,
  UserCheck
} from 'lucide-react';

export default function FrontdeskProfilePage() {
  const { user, updateUser, uploadProfilePicture, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  // Redirect if not authenticated or not frontdesk user
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'frontdesk')) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, user?.role, authLoading, router]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      console.log('User object in frontdesk profile page:', user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        },
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          phone: user.emergencyContact?.phone || '',
          relationship: user.emergencyContact?.relationship || ''
        }
      });
    }
  }, [user]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return value.trim().length < 2 ? `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters` : '';
      case 'phone':
        const phoneRegex = /^[+0][\d]{7,14}$/;
        return value && !phoneRegex.test(value) ? 'Phone number must start with + or 0 and have 8-15 digits total' : '';
      case 'address.street':
        return value.trim().length < 5 ? 'Street address must be at least 5 characters' : '';
      case 'address.city':
        return value.trim().length < 2 ? 'City must be at least 2 characters' : '';
      case 'address.state':
        return value.trim().length < 2 ? 'State must be at least 2 characters' : '';
      case 'address.zipCode':
        return value.trim().length < 3 ? 'ZIP code must be at least 3 characters' : '';
      case 'address.country':
        return value.trim().length < 2 ? 'Country must be at least 2 characters' : '';
      case 'emergencyContact.name':
        return value.trim().length < 2 ? 'Emergency contact name must be at least 2 characters' : '';
      case 'emergencyContact.phone':
        const emergencyPhoneRegex = /^[+0][\d]{7,14}$/;
        return value && !emergencyPhoneRegex.test(value) ? 'Emergency contact phone must start with + or 0 and have 8-15 digits total' : '';
      case 'emergencyContact.relationship':
        return value.trim().length < 2 ? 'Relationship must be at least 2 characters' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormErrors(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: ''
        }
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Update form data
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      phone: validateField('phone', formData.phone),
      address: {
        street: validateField('address.street', formData.address.street),
        city: validateField('address.city', formData.address.city),
        state: validateField('address.state', formData.address.state),
        zipCode: validateField('address.zipCode', formData.address.zipCode),
        country: validateField('address.country', formData.address.country)
      },
      emergencyContact: {
        name: validateField('emergencyContact.name', formData.emergencyContact.name),
        phone: validateField('emergencyContact.phone', formData.emergencyContact.phone),
        relationship: validateField('emergencyContact.relationship', formData.emergencyContact.relationship)
      }
    };

    setFormErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => 
      typeof error === 'string' ? error !== '' : 
      Object.values(error).some(subError => subError !== '')
    );

    return !hasErrors;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate form before saving
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form before saving.",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving frontdesk profile with data:', formData);
      
      // Remove email from form data as it shouldn't be updated via profile update
      const { email, ...profileData } = formData;
      console.log('Profile data being sent:', profileData);
      
      const success = await updateUser(profileData);
      if (success) {
        setIsEditing(false);
        // Clear any existing errors
        setFormErrors({
          firstName: '',
          lastName: '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (passwordErrors[field as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordLoading(true);
      
      // Clear previous errors
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Validate current password
      if (!passwordData.currentPassword) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }));
        return;
      }

      // Validate new password
      if (!passwordData.newPassword) {
        setPasswordErrors(prev => ({ ...prev, newPassword: 'New password is required' }));
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordErrors(prev => ({ ...prev, newPassword: 'New password must be at least 6 characters long' }));
        return;
      }

      // Validate confirm password
      if (!passwordData.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your new password' }));
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        return;
      }

      const result = await AuthService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (result.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        });
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: "Password Change Failed",
          description: result.message || "Failed to change password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Password Change Failed",
        description: "An error occurred while changing your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const success = await uploadProfilePicture(file);
      
      if (!success) {
        toast({
          title: "Upload failed",
          description: "Failed to upload profile picture. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getProfileImageUrl = () => {
    if (!user) return undefined;
    
    // If user has a custom profile image (uploaded to backend)
    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      return `http://localhost:5000${user.profileImage}`;
    }
    
    // If user has a Google profile image (external URL)
    if (user.profileImage && user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    
    // Fallback to undefined (will show initials)
    return undefined;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hms-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'frontdesk') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Please log in as a frontdesk user.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hms-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/frontdesk')}
                className="text-white hover:bg-white/20 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-5xl font-bold mb-6">Frontdesk Profile</h1>
              <p className="text-xl text-blue-100 max-w-3xl">
                Manage your frontdesk account information and preferences
              </p>
            </div>
            <div className="hidden md:block">
              <Building className="w-32 h-32 text-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto">
                      <AvatarImage 
                        src={getProfileImageUrl()} 
                        alt={`${user.firstName} ${user.lastName}`}
                        onError={(e) => {
                          console.error('Avatar image failed to load:', e);
                        }}
                        onLoad={() => {
                          console.log('Avatar image loaded successfully');
                        }}
                      />
                      <AvatarFallback className="bg-hms-primary text-white text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-hms-primary text-white p-2 rounded-full cursor-pointer hover:bg-hms-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <CardTitle className="text-2xl mt-4">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Frontdesk Staff
                  </Badge>
                  <p className="text-gray-600 mt-2">{user.email}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      {user.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Account Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">Account Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={loading}
                    >
                      {isEditing ? (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Cancel Edit
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className={`mt-1 transition-all duration-200 ${
                          formErrors.firstName ? 'animate-shake border-red-500 focus:border-red-500' : 
                          'border-gray-300 focus:border-hms-primary'
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1 mt-1">
                          <span>⚠️</span>
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className={`mt-1 transition-all duration-200 ${
                          formErrors.lastName ? 'animate-shake border-red-500 focus:border-red-500' : 
                          'border-gray-300 focus:border-hms-primary'
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1 mt-1">
                          <span>⚠️</span>
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="mt-1 bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className={`mt-1 transition-all duration-200 ${
                          formErrors.phone ? 'animate-shake border-red-500 focus:border-red-500' : 
                          'border-gray-300 focus:border-hms-primary'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1 mt-1">
                          <span>⚠️</span>
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 transition-all duration-200"
                    />
                  </div>

                  {/* Address Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Address Information</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => handleInputChange('address.street', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1 transition-all duration-200"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.address.city}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.address.state}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={formData.address.zipCode}
                            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.address.country}
                          onChange={(e) => handleInputChange('address.country', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Emergency Contact</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          value={formData.emergencyContact.name}
                          onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyContact.phone}
                          onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </h3>
                    <div className="space-y-4">
                      {/* Hidden dummy fields to trick password managers */}
                      <div style={{ display: 'none' }}>
                        <input type="text" name="username" autoComplete="username" />
                        <input type="password" name="password" autoComplete="current-password" />
                      </div>
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          onFocus={(e) => {
                            // Clear any auto-filled value on focus
                            if (e.target.value && !passwordData.currentPassword) {
                              e.target.value = '';
                              handlePasswordChange('currentPassword', '');
                            }
                          }}
                          className={`mt-1 transition-all duration-200 ${
                            passwordErrors.currentPassword ? 'animate-shake border-red-500 focus:border-red-500' : 
                            'border-gray-300 focus:border-hms-primary'
                          }`}
                          placeholder="Enter your current password"
                          autoComplete="new-password"
                          data-form-type="other"
                          data-lpignore="true"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1 mt-1">
                            <span>⚠️</span>
                            {passwordErrors.currentPassword}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className={`mt-1 transition-all duration-200 ${
                            passwordErrors.newPassword ? 'animate-shake border-red-500 focus:border-red-500' : 
                            'border-gray-300 focus:border-hms-primary'
                          }`}
                          placeholder="Enter your new password"
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1 mt-1">
                            <span>⚠️</span>
                            {passwordErrors.newPassword}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className={`mt-1 transition-all duration-200 ${
                            passwordErrors.confirmPassword ? 'animate-shake border-red-500 focus:border-red-500' : 
                            'border-gray-300 focus:border-hms-primary'
                          }`}
                          placeholder="Confirm your new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1 mt-1">
                            <span>⚠️</span>
                            {passwordErrors.confirmPassword}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleChangePassword}
                        disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-hms-primary hover:bg-hms-primary/90 transition-all duration-200"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6 border-t">
                    {isEditing ? (
                      <div className="flex justify-end space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={loading}
                          className="transition-all duration-200"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-hms-primary hover:bg-hms-primary/90 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
