'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/navbar';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { User, UserRole } from '@/types';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });
  const [showProfileForm, setShowProfileForm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);
        
        // Initialize profile data
        setProfileData({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: {
            street: currentUser.address?.street || '',
            city: currentUser.address?.city || '',
            state: currentUser.address?.state || '',
            zipCode: currentUser.address?.zipCode || '',
            country: currentUser.address?.country || 'USA'
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const result = await AuthService.updateProfile(profileData);
      
      if (result.success) {
        setMessage('Profile updated successfully!');
        setUser(result.user || null);
        setShowProfileForm(false);
      } else {
        setMessage(result.message || 'Update failed');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'employee':
        return 'secondary';
      case 'guest':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your hotel management system today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guest Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Reservations */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">John Doe</div>
                          <div className="text-sm text-muted-foreground">john@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Deluxe Suite 201</TableCell>
                    <TableCell>2024-01-15</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">$299.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Jane Smith</div>
                          <div className="text-sm text-muted-foreground">jane@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Standard Room 105</TableCell>
                    <TableCell>2024-01-16</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">$149.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>MJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Mike Johnson</div>
                          <div className="text-sm text-muted-foreground">mike@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Executive Suite 301</TableCell>
                    <TableCell>2024-01-17</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cancelled
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">$399.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Profile and Quick Actions */}
          <div className="col-span-3 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={user.profileImage ? `http://localhost:5000${user.profileImage}` : undefined} 
                      alt={user.firstName} 
                    />
                    <AvatarFallback>
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowProfileForm(!showProfileForm)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {showProfileForm ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Reservation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Reservations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Guests
                </Button>
                {user.role === 'admin' && (
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Edit Form Modal */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className="mb-6">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Address</h4>
                    <div className="space-y-2">
                      <Label htmlFor="address.street">Street</Label>
                      <Input
                        id="address.street"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.city">City</Label>
                        <Input
                          id="address.city"
                          name="address.city"
                          value={profileData.address.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.state">State</Label>
                        <Input
                          id="address.state"
                          name="address.state"
                          value={profileData.address.state}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.zipCode">ZIP Code</Label>
                        <Input
                          id="address.zipCode"
                          name="address.zipCode"
                          value={profileData.address.zipCode}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address.country">Country</Label>
                        <Input
                          id="address.country"
                          name="address.country"
                          value={profileData.address.country}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProfileForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
