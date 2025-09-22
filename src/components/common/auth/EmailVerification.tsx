import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/layout/card';
import { Badge } from '../../ui/feedback/badge';
import { Alert, AlertDescription } from '../../ui/feedback/alert';
import { Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

type VerificationStatus = 'pending' | 'sent' | 'verified' | 'failed' | 'expired';

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onCancel
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Send verification email on component mount
    sendVerificationEmail();
  }, []);

  useEffect(() => {
    // Resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      setStatus('pending');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('Error sending verification email:', error);
        setStatus('failed');
        toast.error('Failed to send verification email');
        return;
      }

      setStatus('sent');
      setResendCooldown(60); // 60 second cooldown
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      setStatus('failed');
      toast.error('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setAttempts(prev => prev + 1);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        console.error('Verification error:', error);
        
        if (attempts >= 2) {
          setStatus('expired');
          toast.error('Too many failed attempts. Please request a new code.');
        } else {
          toast.error('Invalid verification code. Please try again.');
        }
        return;
      }

      if (data.user) {
        setStatus('verified');
        toast.success('Email verified successfully!');
        setTimeout(() => onVerified(), 1000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    sendVerificationEmail();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sent': return <Mail className="h-5 w-5 text-blue-500" />;
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending': return 'Sending verification email...';
      case 'sent': return 'Verification email sent! Check your inbox and spam folder.';
      case 'verified': return 'Email verified successfully!';
      case 'failed': return 'Failed to send verification email. Please try again.';
      case 'expired': return 'Verification code expired. Please request a new one.';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {getStatusMessage()}
          </AlertDescription>
        </Alert>

        {status === 'sent' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium mb-2">
                Enter verification code
              </label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="text-sm"
              >
                {resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </div>
          </div>
        )}

        {(status === 'failed' || status === 'expired') && (
          <div className="space-y-4">
            <Button onClick={sendVerificationEmail} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send New Verification Email
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>

        {attempts > 0 && (
          <div className="text-center">
            <Badge variant="secondary">
              Attempts: {attempts}/3
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
