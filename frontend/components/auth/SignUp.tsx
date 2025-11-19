'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { validateEmail, validatePassword, AuthService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/index';
import GoogleAuthButton from '@/components/google-auth-button';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUp() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'guest'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isEmailVerified = verificationStatus === 'verified';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'email') {
      setVerificationId(null);
      setVerificationCode('');
      setVerificationStatus('idle');
      setCooldown(0);
      setCodeError(null);
    }

    // Password validation feedback
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation({
        minLength: value.length >= 6,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value)
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email before requesting verification'
      }));
      return;
    }

    if (cooldown > 0 || verificationStatus === 'sending' || isEmailVerified) {
      return;
    }

    try {
      setVerificationStatus('sending');
      const response = await AuthService.requestEmailVerification(formData.email);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification code');
      }

      setVerificationId(response.data?.verificationId || null);
      setVerificationStatus('sent');
      setCooldown(60);
      toast({
        title: 'Verification code sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      setVerificationStatus('idle');
      toast({
        title: 'Unable to send code',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email before verifying'
      }));
      return;
    }

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setCodeError('Please enter the 6-digit verification code');
      return;
    }

    try {
      setCodeError(null);
      setVerificationStatus('verifying');

      const response = await AuthService.verifyEmailCode(formData.email, verificationCode.trim());
      if (!response.success) {
        throw new Error(response.message || 'Invalid verification code');
      }

      setVerificationStatus('verified');
      setVerificationId(response.data?.verificationId || null);
      toast({
        title: 'Email verified',
        description: 'You can now create your account.',
      });
    } catch (error: any) {
      setVerificationStatus('sent');
      setCodeError(error.message || 'Invalid verification code');
      toast({
        title: 'Verification failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!isEmailVerified || !verificationId) {
      setErrors(prev => ({
        ...prev,
        email: 'Please verify your email before creating an account'
      }));
      toast({
        title: 'Email verification required',
        description: 'Please verify your email address to continue.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const success = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
        verificationId
      });
      
      if (success) {
        // AuthContext handles the redirect and toast notification
        // No need to do anything here
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/IMG-20250815-WA0005.jpg')",
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      ></div>
      
      {/* Dark Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Gradient Overlay for Better Form Visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-blue-50/30 to-indigo-100/40"></div>

      <div className="relative z-10 w-full max-w-md py-8">
        <Card className="shadow-2xl border border-white/30 bg-white/90 backdrop-blur-lg animate-slide-up ring-1 ring-white/20">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-hms-primary/20 shadow-lg">
                <Image
                  src="/logo.jpg"
                  alt="HMS Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-hms-primary">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Join HMS and start your hospitality journey
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Sign Up */}
            <GoogleAuthButton mode="signup" />

            {/* Divider */}
            <div className="relative">
              <Separator className="my-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-3 text-sm text-gray-500 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative group">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                      focusedField === 'firstName' ? 'text-hms-primary' : 'text-gray-400'
                    }`} />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="First name"
                      className={`pl-10 transition-all duration-200 ${
                        errors.firstName ? 'animate-shake border-red-500 focus:border-red-500' : 
                        focusedField === 'firstName' ? 'border-hms-primary shadow-lg shadow-hms-primary/20' : 
                        'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="relative group">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                      focusedField === 'lastName' ? 'text-hms-primary' : 'text-gray-400'
                    }`} />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Last name"
                      className={`pl-10 transition-all duration-200 ${
                        errors.lastName ? 'animate-shake border-red-500 focus:border-red-500' : 
                        focusedField === 'lastName' ? 'border-hms-primary shadow-lg shadow-hms-primary/20' : 
                        'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-hms-primary' : 'text-gray-400'
                  }`} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email"
                    className={`pl-10 transition-all duration-200 ${
                      errors.email ? 'animate-shake border-red-500 focus:border-red-500' : 
                      focusedField === 'email' ? 'border-hms-primary shadow-lg shadow-hms-primary/20' : 
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-sm"
                    onClick={handleSendVerificationCode}
                    disabled={verificationStatus === 'sending' || cooldown > 0 || isEmailVerified}
                  >
                    {verificationStatus === 'sending'
                      ? 'Sending...'
                      : cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : isEmailVerified
                          ? 'Email Verified'
                          : 'Send Verification Code'}
                  </Button>
                  {verificationStatus === 'sent' && (
                    <span className="text-sm text-gray-600">
                      Code sent! Enter it below to verify.
                    </span>
                  )}
                  {isEmailVerified && (
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Verification Code Field */}
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(event) => {
                        setVerificationCode(event.target.value.replace(/\D/g, ''));
                        setCodeError(null);
                      }}
                      disabled={isEmailVerified}
                      placeholder="Enter 6-digit code"
                      className={`pl-4 transition-all duration-200 ${
                        isEmailVerified
                          ? 'border-green-500'
                          : codeError
                            ? 'border-red-500 animate-shake'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {codeError && (
                      <p className="text-sm text-red-600 animate-fade-in mt-1">
                        {codeError}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={isEmailVerified ? 'outline' : 'default'}
                    onClick={handleVerifyCode}
                    disabled={
                      verificationStatus === 'verifying' ||
                      verificationCode.length !== 6 ||
                      isEmailVerified
                    }
                    className={`md:w-40 ${isEmailVerified ? 'bg-green-600 hover:bg-green-600/90 text-white' : ''}`}
                  >
                    {isEmailVerified
                      ? 'Verified'
                      : verificationStatus === 'verifying'
                        ? 'Verifying...'
                        : 'Verify Code'}
                  </Button>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-hms-primary' : 'text-gray-400'
                  }`} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create a password"
                    className={`pl-10 pr-10 transition-all duration-200 ${
                      errors.password ? 'animate-shake border-red-500 focus:border-red-500' : 
                      focusedField === 'password' ? 'border-hms-primary shadow-lg shadow-hms-primary/20' : 
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </Button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`} />
                      At least 6 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`} />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`} />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`w-3 h-3 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`} />
                      One number
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focusedField === 'confirmPassword' ? 'text-hms-primary' : 'text-gray-400'
                  }`} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 transition-all duration-200 ${
                      errors.confirmPassword ? 'animate-shake border-red-500 focus:border-red-500' : 
                      focusedField === 'confirmPassword' ? 'border-hms-primary shadow-lg shadow-hms-primary/20' : 
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 animate-fade-in flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={loading || !isEmailVerified}
                className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{isEmailVerified ? 'Create Account' : 'Verify Email to Continue'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="text-hms-primary hover:text-hms-secondary font-medium transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
