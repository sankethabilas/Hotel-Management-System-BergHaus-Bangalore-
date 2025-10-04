'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  Receipt, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  Search,
  Bell,
  Hotel,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProfileImageUrl, getUserInitials } from '@/utils/profileImage';

interface FrontdeskLayoutProps {
  children: React.ReactNode;
}

export default function FrontdeskLayout({ children }: FrontdeskLayoutProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (mobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Navigation items
    const navigationItems = [
      {
        name: 'Dashboard',
        href: '/frontdesk/dashboard',
        icon: LayoutDashboard,
        current: pathname === '/frontdesk/dashboard'
      },
      {
        name: 'Check-In / Check-Out',
        href: '/frontdesk/checkin-checkout',
        icon: UserCheck,
        current: pathname === '/frontdesk/checkin-checkout'
      },
      {
        name: 'Booking History',
        href: '/frontdesk/booking-history',
        icon: History,
        current: pathname === '/frontdesk/booking-history'
      },
      {
        name: 'Profile',
        href: '/frontdesk/profile',
        icon: User,
        current: pathname === '/frontdesk/profile'
      },
      {
        name: 'Settings',
        href: '/frontdesk/settings',
        icon: Settings,
        current: pathname === '/frontdesk/settings'
      }
    ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (!loading && user && user.role !== 'frontdesk' && user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Show search options or redirect to reservations page with search query
      toast({
        title: "Search Results",
        description: `Searching for "${searchQuery}" across all reservations, bookings, and bills...`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              router.push(`/frontdesk/reservations?search=${encodeURIComponent(searchQuery.trim())}`);
              setSearchQuery('');
            }}
          >
            View Results
          </Button>
        ),
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getProfileImageUrlForUser = (user: any) => {
    return getProfileImageUrl(user?.profileImage);
  };

  const getUserInitialsForUser = (user: any) => {
    return getUserInitials(user?.firstName, user?.lastName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bb8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/frontdesk/dashboard" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-[#006bb8] rounded-lg">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#006bb8] hidden sm:block">HMS</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        item.current
                          ? "bg-[#006bb8] text-white"
                          : "text-gray-600 hover:text-[#006bb8] hover:bg-blue-50"
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Hidden on mobile */}
              <form onSubmit={handleSearch} className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search guests, reservations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 h-9"
                />
              </form>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage 
                        src={getProfileImageUrlForUser(user)} 
                        alt={`${user?.firstName} ${user?.lastName}`} 
                      />
                      <AvatarFallback className="bg-[#006bb8] text-white text-sm">
                        {getUserInitialsForUser(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs text-[#006bb8] font-medium">Frontdesk Officer</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/frontdesk/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/frontdesk/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <div className="md:hidden relative mobile-menu-container">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="p-4 space-y-4">
                      {/* Mobile Search */}
                      <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </form>

                      {/* Mobile Navigation */}
                      <div className="space-y-2">
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors w-full",
                                item.current
                                  ? "bg-[#006bb8] text-white"
                                  : "text-gray-600 hover:text-[#006bb8] hover:bg-blue-50"
                              )}
                            >
                              <Icon className="w-5 h-5 mr-3" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Mobile User Info */}
                      <div className="border-t pt-4 mt-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={getProfileImageUrlForUser(user)} 
                              alt={`${user?.firstName} ${user?.lastName}`} 
                            />
                            <AvatarFallback className="bg-[#006bb8] text-white">
                              {getUserInitialsForUser(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-gray-500">Frontdesk Officer</p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleLogout} 
                          variant="outline" 
                          className="w-full"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}