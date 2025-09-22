import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/forms/input-otp';
import { Alert, AlertDescription } from '../../ui/feedback/alert';
import { Phone, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../database/supabase/client';
import smsService from '../../../database/notifications/smsService';
import { useAuth } from '../../../contexts/AuthContext';

interface MobileVerificationProps {
  phoneNumber: string;
  onVerified: (verifiedPhone: string) => void;
  onCancel: () => void;
}

export const MobileVerification: React.FC<MobileVerificationProps> = ({
  phoneNumber,
  onVerified,
  onCancel
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'send' | 'verify'>('send');
  const { state } = useAuth();
  const user = state.user;

  useEffect(() => {
    if (verificationStep === 'verify' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, verificationStep]);

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if user can request new OTP
      const canRequest = await smsService.canRequestOTP(user.id, `+91${phoneNumber}`);
      if (!canRequest) {
        toast.error('Please wait before requesting a new OTP');
        return;
      }

      // Generate OTP
      const otpCode = smsService.generateOTP();
      
      // Send OTP via Twilio
      const smsSent = await smsService.sendOTP(`+91${phoneNumber}`, otpCode);
      
      if (smsSent) {
        // Store OTP in database
        const stored = await smsService.storeOTP(user.id, `+91${phoneNumber}`, otpCode);
        
        if (stored) {
          setVerificationStep('verify');
          setTimeLeft(60);
          setCanResend(false);
          toast.success(`OTP sent to +91${phoneNumber}`);
        } else {
          toast.error('Failed to store OTP. Please try again.');
        }
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      
      // Verify OTP using SMS service
      const isValid = await smsService.verifyOTP(user.id, `+91${phoneNumber}`, otp);
      
      if (isValid) {
        toast.success('Phone number verified successfully!');
        onVerified(`+91${phoneNumber}`);
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const resendOTP = async () => {
    setCanResend(false);
    setTimeLeft(60);
    setOtp('');
    await sendOTP();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (verificationStep === 'send') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Verify Phone Number
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              We'll send a verification code to
            </p>
            <p className="font-medium text-lg">+91{phoneNumber}</p>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure this phone number is correct and you have access to it.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Change Number
            </Button>
            <Button
              onClick={sendOTP}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-6 w-6 text-primary" />
          Enter Verification Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to
          </p>
          <p className="font-medium text-lg">+91{phoneNumber}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
          >
            <InputOTPGroup className="justify-center">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center space-y-2">
          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Resend code in {formatTime(timeLeft)}</span>
            </div>
          ) : (
            <Button
              variant="link"
              onClick={resendOTP}
              disabled={isLoading}
              className="text-sm"
            >
              Resend Code
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setVerificationStep('send')}
            className="flex-1"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={verifyOTP}
            disabled={isLoading || otp.length !== 6}
            className="flex-1"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Didn't receive the code? Check your SMS or try resending.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};