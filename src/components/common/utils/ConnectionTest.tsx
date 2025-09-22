import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Badge } from '../../ui/feedback/badge';
import { CheckCircle, XCircle, Loader2, Database, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../../../database/supabase/client';
import smsService from '../../../database/notifications/smsService';
import emailService from '../../../database/notifications/emailService';
import { toast } from 'sonner';

interface ConnectionStatus {
  supabase: 'testing' | 'connected' | 'error';
  twilio: 'testing' | 'connected' | 'error';
  smtp: 'testing' | 'connected' | 'error';
}

export const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: 'testing',
    twilio: 'testing',
    smtp: 'testing'
  });
  const [testing, setTesting] = useState(false);

  const testSupabaseConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, supabase: 'testing' }));
      
      // Test database connection and products table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (profilesError) throw profilesError;
      
      // Test products table
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, product_type')
        .limit(5);
      
      if (productsError) {
        console.error('Products table error:', productsError);
        toast.error(`Products table issue: ${productsError.message}`);
      } else {
        console.log('Products found:', productsData?.length || 0);
        if (productsData && productsData.length > 0) {
          toast.success(`Supabase connected! Found ${productsData.length} products.`);
        } else {
          toast.warning('Supabase connected but no products found. Check database setup.');
        }
      }
      
      setStatus(prev => ({ ...prev, supabase: 'connected' }));
      return true;
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setStatus(prev => ({ ...prev, supabase: 'error' }));
      toast.error(`Supabase connection failed: ${error.message}`);
      return false;
    }
  };

  const testTwilioConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, twilio: 'testing' }));
      
      // Test SMS service (demo mode)
      const success = await smsService.sendOTP('+919876543210', '123456');
      
      if (success) {
        setStatus(prev => ({ ...prev, twilio: 'connected' }));
        toast.success('Twilio SMS service configured!');
        return true;
      } else {
        throw new Error('SMS service failed');
      }
    } catch (error: any) {
      console.error('Twilio connection error:', error);
      setStatus(prev => ({ ...prev, twilio: 'error' }));
      toast.error(`Twilio connection failed: ${error.message}`);
      return false;
    }
  };

  const testSMTPConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, smtp: 'testing' }));
      
      // Test email service (demo mode)
      const success = await emailService.sendEmail('test@example.com', {
        subject: 'Connection Test',
        html: '<h1>Test Email</h1><p>This is a test email to verify SMTP connection.</p>',
        text: 'Test Email - This is a test email to verify SMTP connection.'
      });
      
      if (success) {
        setStatus(prev => ({ ...prev, smtp: 'connected' }));
        toast.success('SMTP email service configured!');
        return true;
      } else {
        throw new Error('Email service failed');
      }
    } catch (error: any) {
      console.error('SMTP connection error:', error);
      setStatus(prev => ({ ...prev, smtp: 'error' }));
      toast.error(`SMTP connection failed: ${error.message}`);
      return false;
    }
  };

  const testAllConnections = async () => {
    setTesting(true);
    setStatus({
      supabase: 'testing',
      twilio: 'testing',
      smtp: 'testing'
    });

    try {
      await Promise.all([
        testSupabaseConnection(),
        testTwilioConnection(),
        testSMTPConnection()
      ]);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Connection Test Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Test all service connections for IoT Hub
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Supabase Connection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Supabase Database
            </CardTitle>
            {getStatusIcon(status.supabase)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusBadge(status.supabase)}
              </div>
              <div className="text-xs text-muted-foreground">
                Project ID: {import.meta.env.VITE_SUPABASE_PROJECT_ID || 'Not configured'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testSupabaseConnection}
                disabled={testing}
                className="w-full"
              >
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Twilio SMS Connection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Twilio SMS
            </CardTitle>
            {getStatusIcon(status.twilio)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusBadge(status.twilio)}
              </div>
              <div className="text-xs text-muted-foreground">
                Account SID: {import.meta.env.VITE_TWILIO_ACCOUNT_SID ? 'Configured' : 'Not configured'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testTwilioConnection}
                disabled={testing}
                className="w-full"
              >
                Test SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Email Connection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              SMTP Email
            </CardTitle>
            {getStatusIcon(status.smtp)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusBadge(status.smtp)}
              </div>
              <div className="text-xs text-muted-foreground">
                Host: {import.meta.env.VITE_EMAIL_SERVICE_HOST || 'Not configured'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testSMTPConnection}
                disabled={testing}
                className="w-full"
              >
                Test Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={testAllConnections}
          disabled={testing}
          size="lg"
          className="px-8"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing All Connections...
            </>
          ) : (
            'Test All Connections'
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Supabase Project ID:</span>
              <Badge variant={import.meta.env.VITE_SUPABASE_PROJECT_ID ? "default" : "destructive"}>
                {import.meta.env.VITE_SUPABASE_PROJECT_ID ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Supabase Anon Key:</span>
              <Badge variant={import.meta.env.VITE_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Twilio Account SID:</span>
              <Badge variant={import.meta.env.VITE_TWILIO_ACCOUNT_SID ? "default" : "destructive"}>
                {import.meta.env.VITE_TWILIO_ACCOUNT_SID ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Twilio Auth Token:</span>
              <Badge variant={import.meta.env.VITE_TWILIO_AUTH_TOKEN ? "default" : "destructive"}>
                {import.meta.env.VITE_TWILIO_AUTH_TOKEN ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Email Service Host:</span>
              <Badge variant={import.meta.env.VITE_EMAIL_SERVICE_HOST ? "default" : "destructive"}>
                {import.meta.env.VITE_EMAIL_SERVICE_HOST || 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Email Service Password:</span>
              <Badge variant={import.meta.env.VITE_EMAIL_SERVICE_PASS ? "default" : "destructive"}>
                {import.meta.env.VITE_EMAIL_SERVICE_PASS ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>UPI ID:</span>
              <Badge variant={import.meta.env.VITE_UPI_ID ? "default" : "destructive"}>
                {import.meta.env.VITE_UPI_ID || 'Missing'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
