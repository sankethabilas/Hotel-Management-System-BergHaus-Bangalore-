'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileImageUrl, getUserInitials } from '@/utils/profileImage';

export default function ProfilePage() {
  const { user, updateUser, uploadProfilePicture } = useAuth();
  const { toast } = useToast();
  
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
    }
  });
  const [loading, setLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
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
          country: user.address?.country || 'USA'
        }
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected for upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      setProfileImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload profile picture first if changed
      if (profileImageFile) {
        console.log('Uploading profile picture...');
        const uploadSuccess = await uploadProfilePicture(profileImageFile);
        if (!uploadSuccess) {
          console.log('Profile picture upload failed');
          toast({
            title: "Error",
            description: "Failed to upload profile picture",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        console.log('Profile picture upload successful');
      }

      // Update profile data
      const success = await updateUser(formData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        
        // Clear preview
        setProfileImageFile(null);
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserInitialsForUser = () => {
    return getUserInitials(user?.firstName, user?.lastName);
  };

  const getProfileImageUrlForUser = () => {
    if (previewUrl) return previewUrl;
    return getProfileImageUrl(user?.profileImage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#006bb8]">Profile</h1>
          <p className="text-gray-600">Manage your personal information and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#006bb8]">
              <Camera className="w-5 h-5 mr-2" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={getProfileImageUrlForUser()} 
                  alt={`${user?.firstName} ${user?.lastName}`} 
                />
                <AvatarFallback className="bg-[#006bb8] text-white text-xl">
                  {getUserInitialsForUser()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profileImage" className="cursor-pointer">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-[#006bb8] text-white rounded-lg hover:bg-[#006bb8]/90 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>Change Picture</span>
                  </div>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#006bb8]">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#006bb8]">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address.street">Street Address</Label>
              <Input
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address.city">City</Label>
                <Input
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="address.state">State/Province</Label>
                <Input
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="address.zipCode">ZIP/Postal Code</Label>
                <Input
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address.country">Country</Label>
              <Input
                id="address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#006bb8]">
              <User className="w-5 h-5 mr-2" />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Current Role</p>
              <p className="font-medium text-[#006bb8] capitalize">
                {user?.role === 'frontdesk' ? 'Frontdesk Officer' : user?.role}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contact your administrator to change your role
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
