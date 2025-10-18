import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/theme-toggle';
import MessagesDropdown from '@/components/messages-dropdown';
import { safeJsonParse } from '@/lib/safeJsonParse';
import { getProfileImageUrl, getUserInitials } from '@/utils/profileImage';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const { user, isAuthenticated, logout, loading } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/contact/user/messages?status=new', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data.success) {
          const unreadMessages = data.data?.docs?.filter((msg: any) => !msg.isRead) || [];
          setUnreadCount(unreadMessages.length);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const getUserInitialsForUser = (user: any) => {
    return getUserInitials(user?.firstName, user?.lastName);
  };

  const getProfileImageUrlForUser = (user: any) => {
    return getProfileImageUrl(user?.profileImage);
  };

  return (
    <nav className={`bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-500 sticky top-0 z-50 transition-colors duration-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-hms-primary/20">
              <Image
                src="/logo.jpg"
                alt="HMS Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-lg font-bold text-hms-primary group-hover:text-hms-secondary transition-colors duration-200">
             Berghaus Bungalow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/rooms" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
            >
              Rooms
            </Link>
            <Link 
              href="/facilities" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
            >
              Facilities
            </Link>
            <Link 
              href="/Food-home" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
            >
              Food Menu
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
            >
              Contact Us
            </Link>
            {isAuthenticated ? (
              <Link 
                href="/reservations" 
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
              >
                Reservations
              </Link>
            ) : (
              <Link 
                href="/auth/signin" 
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary transition-colors duration-200 font-medium"
                title="Sign in to view reservations"
              >
                Reservations
              </Link>
            )}
            <Link 
              href="/booking" 
              className="text-sm bg-hms-primary hover:bg-hms-primary/90 text-white px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 font-medium"
            >
              Book Now
            </Link>
            
            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Authentication Section */}
              {loading ? (
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-500 animate-pulse"></div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getProfileImageUrlForUser(user)} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback className="bg-hms-primary text-white">
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
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsMessagesOpen(true)} className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/signin">
                  <Button className="bg-hms-primary hover:bg-hms-primary/90 text-white transition-all duration-200 hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-500">
              <Link
                href="/"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/rooms"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Rooms
              </Link>
              <Link
                href="/facilities"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Facilities
              </Link>
              <Link
                href="/Food-home"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Food Menu
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/reservations"
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reservations
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                  title="Sign in to view reservations"
                >
                  Reservations
                </Link>
              )}
              <Link
                href="/booking"
                className="block px-3 py-2 text-sm bg-hms-primary hover:bg-hms-primary/90 text-white rounded-md transition-colors duration-200 text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
              {/* Mobile Authentication Section */}
              {loading ? (
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-500">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-500 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-500 animate-pulse rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-500 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-500">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getProfileImageUrlForUser(user)} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback className="bg-hms-primary text-white">
                          {getUserInitialsForUser(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsMessagesOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-between w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-hms-primary dark:hover:text-hms-secondary hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                      >
                        <span>Messages</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-3 py-2">
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Dropdown */}
      <MessagesDropdown 
        isOpen={isMessagesOpen} 
        onClose={() => setIsMessagesOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </nav>
  );
}
