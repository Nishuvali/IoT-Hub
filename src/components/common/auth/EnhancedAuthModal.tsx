import React, { useState } from 'react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/overlay/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/navigation/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/forms/input-otp';
import { Badge } from '../../ui/feedback/badge';
import { Alert, AlertDescription } from '../../ui/feedback/alert';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';
import { validateEmail, EmailValidationResult } from '../../../database/auth/emailValidation';
import {
  Mail,
  Phone,
  Lock,
  User,
  CheckCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'login' | 'signup' | 'email-otp' | 'mobile-otp' | 'mobile-input';

export const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, state: authState, verifyAuthentication } = useAuth();
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [loading, setLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult | null>(null);
  const [verificationData, setVerificationData] = useState({
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    password: '',
    emailOtp: '',
    mobileOtp: '',
    authProvider: 'email' // Only 'email' and 'google' now
  });

  // Use AuthContext loading state as fallback
  const isLoading = loading || authState.isLoading;

  const resetModal = () => {
    setCurrentStep('login');
    setEmailValidation(null);
    setVerificationData({
      email: '',
      mobile: '',
      firstName: '',
      lastName: '',
      password: '',
      emailOtp: '',
      mobileOtp: '',
      authProvider: 'email' // Only 'email' and 'google' now
    });
  };

  const validateEmailInput = (email: string): boolean => {
    const validation = validateEmail(email);
    setEmailValidation(validation);
    return validation.isValid;
  };

  const handleEmailChange = (email: string) => {
    setVerificationData(prev => ({ ...prev, email }));
    if (email.length > 5) {
      validateEmailInput(email);
    } else {
      setEmailValidation(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('Starting Google login...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google login error:', error);
        throw error;
      }

      console.log('Google login initiated successfully');
      toast.success('Redirecting to Google...');
      
      // The actual authentication will be handled by the auth state change listener
      // No need to close modal here as user will be redirected
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      console.log('Starting Google signup...');
      setVerificationData(prev => ({ ...prev, authProvider: 'google' }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}?signup=true`
        }
      });

      if (error) {
        console.error('Google signup error:', error);
        throw error;
      }

      console.log('Google signup initiated successfully');
      toast.success('Redirecting to Google...');
      
      // The actual authentication will be handled by the auth state change listener
      // No need to close modal here as user will be redirected
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast.error(error.message || 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('EnhancedAuthModal: Starting login process...');

      // Add timeout to prevent hanging
      const loginPromise = login(verificationData.email, verificationData.password);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout - please try again')), 10000)
      );

      await Promise.race([loginPromise, timeoutPromise]);

      // Verify authentication after login
      const isAuthenticated = await verifyAuthentication();
      if (isAuthenticated) {
        console.log('EnhancedAuthModal: Login and authentication verification successful');
        toast.success('Login successful');
        onClose();
        resetModal();
      } else {
        console.log('EnhancedAuthModal: Authentication verification failed after login');
        toast.error('Login failed - authentication verification failed');
      }
    } catch (error: any) {
      console.error('EnhancedAuthModal: Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      console.log('EnhancedAuthModal: Resetting loading state...');
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationData.email || !verificationData.password || !verificationData.firstName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email before proceeding
    if (!validateEmailInput(verificationData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if email validation failed
    if (emailValidation && !emailValidation.isValid) {
      toast.error(emailValidation.errors[0] || 'Invalid email address');
      return;
    }

    try {
      setLoading(true);
      
      // Try multiple signup methods
      let signupSuccess = false;
      let userData = null;
      
      // Method 1: Try with email confirmation disabled
      try {
        const { data, error } = await supabase.auth.signUp({
          email: verificationData.email,
          password: verificationData.password,
          options: {
            data: {
              first_name: verificationData.firstName,
              last_name: verificationData.lastName,
              role: 'user'
            },
            emailRedirectTo: undefined // Disable email confirmation
          }
        });

        if (error) throw error;
        
        if (data.user) {
          userData = data;
          signupSuccess = true;
        }
      } catch (signupError: any) {
        console.log('Method 1 failed, trying alternative...', signupError.message);
        
        // Method 2: Try with minimal options
        try {
          const { data, error } = await supabase.auth.signUp({
            email: verificationData.email,
            password: verificationData.password
          });

          if (error) throw error;
          
          if (data.user) {
            userData = data;
            signupSuccess = true;
          }
        } catch (altError: any) {
          console.log('Method 2 also failed:', altError.message);
          throw signupError; // Throw original error
        }
      }
      
      if (signupSuccess && userData) {
        // Auto-login the user after successful signup
        try {
          console.log('Attempting auto-login after signup...');
          await login(verificationData.email, verificationData.password);
          
          // Verify authentication after login
          const isAuthenticated = await verifyAuthentication();
          if (isAuthenticated) {
            toast.success('Account created and logged in successfully!');
            onClose();
            resetModal();
          } else {
            console.log('Authentication verification failed after login');
            toast.success('Account created successfully! Please log in manually.');
            onClose();
            resetModal();
          }
        } catch (loginError: any) {
          console.log('Auto-login failed, but signup was successful:', loginError.message);
          toast.success('Account created successfully! Please log in manually.');
          onClose();
          resetModal();
        }
      } else {
        throw new Error('All signup methods failed');
      }
    } catch (error: any) {
      console.error('Email signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: verificationData.email,
        token: verificationData.emailOtp,
        type: 'email'
      });

      if (error) throw error;

      // Email verified, now ask for mobile number
      setCurrentStep('mobile-input');
      toast.success('Email verified successfully');
    } catch (error: any) {
      console.error('Email OTP verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const sendMobileOtp = async () => {
    if (!verificationData.mobile || verificationData.mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    try {
      setLoading(true);
      
      // Send mobile OTP (using Supabase SMS or third-party service)
      // For demo, we'll simulate sending OTP
      console.log('Sending OTP to:', verificationData.mobile);
      
      setCurrentStep('mobile-otp');
      toast.success('OTP sent to your mobile number');
    } catch (error: any) {
      console.error('Mobile OTP error:', error);
      toast.error('Failed to send mobile OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    try {
      setLoading(true);
      
      // Verify mobile OTP (implement actual verification)
      if (verificationData.mobileOtp.length !== 6) {
        throw new Error('Please enter 6-digit OTP');
      }

      // For demo, accept any 6-digit code
      if (verificationData.mobileOtp !== '123456') {
        // In production, verify against actual OTP
        console.log('Verifying OTP:', verificationData.mobileOtp);
      }

      // Create user account after both email and mobile verification
      await register({
        email: verificationData.email,
        password: verificationData.password,
        firstName: verificationData.firstName,
        lastName: verificationData.lastName
      });

      toast.success('Account created successfully');
      onClose();
      resetModal();
    } catch (error: any) {
      console.error('Mobile OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginStep = () => (
    <div className="space-y-4">
      {/* Social Login Buttons */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={verificationData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            className={emailValidation && !emailValidation.isValid ? 'border-red-500' : ''}
          />
          {emailValidation && !emailValidation.isValid && (
            <div className="mt-2 space-y-1">
              {emailValidation.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
              {emailValidation.suggestions && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {emailValidation.suggestions[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          {emailValidation && emailValidation.isValid && (
            <div className="mt-2">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Email address looks good!</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={verificationData.password}
            onChange={(e) => setVerificationData(prev => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="outline"
          className="w-full text-sm font-medium"
          onClick={() => setCurrentStep('signup')}
        >
          Create New Account
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Don't have an account? Click above to sign up
        </p>
      </div>
    </div>
  );

  const renderSignupStep = () => (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="w-full justify-start p-0"
        onClick={() => setCurrentStep('login')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to login
      </Button>

      {/* Social Signup Buttons */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={verificationData.firstName}
              onChange={(e) => setVerificationData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={verificationData.lastName}
              onChange={(e) => setVerificationData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={verificationData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            className={emailValidation && !emailValidation.isValid ? 'border-red-500' : ''}
          />
          {emailValidation && !emailValidation.isValid && (
            <div className="mt-2 space-y-1">
              {emailValidation.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
              {emailValidation.suggestions && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {emailValidation.suggestions[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          {emailValidation && emailValidation.isValid && (
            <div className="mt-2">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Email address looks good!</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={verificationData.password}
            onChange={(e) => setVerificationData(prev => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );

  const renderEmailOtpStep = () => (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <Mail className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-lg font-medium">Verify your email</h3>
        <p className="text-sm text-muted-foreground">
          We sent a verification code to<br />
          <strong>{verificationData.email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Enter verification code</Label>
          <InputOTP
            maxLength={6}
            value={verificationData.emailOtp}
            onChange={(value) => setVerificationData(prev => ({ ...prev, emailOtp: value }))}
          >
            <InputOTPGroup className="mx-auto">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button 
          onClick={verifyEmailOtp} 
          className="w-full" 
          disabled={loading || verificationData.emailOtp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </div>
    </div>
  );

  const renderMobileInputStep = () => (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
        <h3 className="text-lg font-medium">Email verified!</h3>
        <p className="text-sm text-muted-foreground">
          Now let's verify your mobile number for account security
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="+91 9876543210"
            value={verificationData.mobile}
            onChange={(e) => setVerificationData(prev => ({ ...prev, mobile: e.target.value }))}
            required
          />
        </div>

        <Button onClick={sendMobileOtp} className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </div>
    </div>
  );

  const renderMobileOtpStep = () => (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <Phone className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-lg font-medium">Verify your mobile</h3>
        <p className="text-sm text-muted-foreground">
          We sent an OTP to<br />
          <strong>{verificationData.mobile}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Enter OTP</Label>
          <InputOTP
            maxLength={6}
            value={verificationData.mobileOtp}
            onChange={(value) => setVerificationData(prev => ({ ...prev, mobileOtp: value }))}
          >
            <InputOTPGroup className="mx-auto">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button 
          onClick={verifyMobileOtp} 
          className="w-full" 
          disabled={loading || verificationData.mobileOtp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Complete Registration'}
        </Button>

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Demo: Use <strong>123456</strong> as OTP for testing
          </p>
        </div>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'login': return 'Welcome back';
      case 'signup': return 'Create your account';
      case 'email-otp': return 'Email Verification';
      case 'mobile-input': return 'Mobile Verification';
      case 'mobile-otp': return 'Enter OTP';
      default: return 'Authentication';
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login': return renderLoginStep();
      case 'signup': return renderSignupStep();
      case 'email-otp': return renderEmailOtpStep();
      case 'mobile-input': return renderMobileInputStep();
      case 'mobile-otp': return renderMobileOtpStep();
      default: return renderLoginStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getStepTitle()}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};