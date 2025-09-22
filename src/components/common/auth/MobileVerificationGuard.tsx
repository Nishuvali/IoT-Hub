import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/overlay/dialog';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/forms/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';

interface MobileVerificationGuardProps {
  children: React.ReactNode;
}

export const MobileVerificationGuard: React.FC<MobileVerificationGuardProps> = ({ children }) => {
  const { state: authState } = useAuth();
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Check if user needs mobile verification
    const checkMobileVerification = async () => {
      if (authState.isAuthenticated && authState.user) {
        // Check if user signed up via social auth and needs mobile verification
        const urlParams = new URLSearchParams(window.location.search);
        const isSignup = urlParams.get('signup') === 'true';
        
        if (isSignup) {
          // Check if user has verified mobile number
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', authState.user.id)
            .single();

          if (!error && profile) {
            // If social auth user without phone number
            if (!profile.phone) {
              setShowMobileVerification(true);
            }
          }
          
          // Clear the signup parameter from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    checkMobileVerification();
  }, [authState.isAuthenticated, authState.user]);

  const sendMobileOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, integrate with SMS service
      // For demo, we'll just show the OTP step
      console.log('Sending OTP to:', mobileNumber);
      
      // Update user profile with mobile number
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone: mobileNumber })
        .eq('id', authState.user?.id);

      if (updateError) throw updateError;

      setStep('otp');
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
      
      if (otp.length !== 6) {
        throw new Error('Please enter 6-digit OTP');
      }

      // For demo, accept any 6-digit code or 123456
      if (otp !== '123456') {
        console.log('Verifying OTP:', otp);
      }

      // Mark mobile as verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          phone: mobileNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user?.id);

      if (updateError) throw updateError;

      toast.success('Mobile number verified successfully!');
      setShowMobileVerification(false);
    } catch (error: any) {
      console.error('Mobile OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderMobileInput = () => (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <Phone className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-lg font-medium">Verify Your Mobile Number</h3>
        <p className="text-sm text-muted-foreground">
          To complete your account setup, please verify your mobile number for security purposes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="+91 9876543210"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>

        <Button onClick={sendMobileOtp} className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send Verification Code'}
        </Button>
      </div>
    </div>
  );

  const renderOtpInput = () => (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
        <h3 className="text-lg font-medium">Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground">
          We sent a verification code to<br />
          <strong>{mobileNumber}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Enter OTP</Label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
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
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Mobile Number'}
        </Button>

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Demo: Use <strong>123456</strong> as OTP for testing
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => setStep('input')}
          className="w-full"
        >
          Change Mobile Number
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {children}
      
      <Dialog open={showMobileVerification} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">Mobile Verification Required</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {step === 'input' ? renderMobileInput() : renderOtpInput()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};