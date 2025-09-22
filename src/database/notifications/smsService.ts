// SMS Service for Mobile Verification
import { supabase } from '../supabase/client';

interface SMSConfig {
  provider: 'twilio' | 'aws-sns' | 'demo';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
}

class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  // Generate OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via SMS
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const message = `Your IoT Solutions Hub verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(phoneNumber, message);
        case 'aws-sns':
          return await this.sendViaAWS(phoneNumber, message);
        case 'demo':
          return await this.sendViaDemo(phoneNumber, message);
        default:
          throw new Error('Invalid SMS provider');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  // Twilio SMS
  private async sendViaTwilio(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken || !this.config.twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    try {
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.config.twilioAccountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(this.config.twilioAccountSid + ':' + this.config.twilioAuthToken),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: this.config.twilioPhoneNumber,
          Body: message,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return false;
    }
  }

  // AWS SNS SMS
  private async sendViaAWS(phoneNumber: string, message: string): Promise<boolean> {
    // AWS SNS implementation would go here
    // For now, return demo mode
    console.log('AWS SNS SMS:', { phoneNumber, message });
    return true;
  }

  // Demo SMS (for development)
  private async sendViaDemo(phoneNumber: string, message: string): Promise<boolean> {
    console.log('📱 DEMO SMS SENT:');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('---');
    
    // In demo mode, always return success
    return true;
  }

  // Store OTP in database
  async storeOTP(userId: string, phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

      const { error } = await supabase
        .from('mobile_otp_verification')
        .insert({
          user_id: userId,
          mobile_number: phoneNumber,
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          verified: false,
          attempts: 0
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to store OTP:', error);
      return false;
    }
  }

  // Verify OTP
  async verifyOTP(userId: string, phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('mobile_otp_verification')
        .select('*')
        .eq('user_id', userId)
        .eq('mobile_number', phoneNumber)
        .eq('otp_code', otp)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // Increment attempts
        await this.incrementAttempts(userId, phoneNumber);
        return false;
      }

      // Mark as verified
      await supabase
        .from('mobile_otp_verification')
        .update({ verified: true })
        .eq('id', data.id);

      // Update user profile
      await supabase
        .from('profiles')
        .update({ 
          phone: phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return true;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    }
  }

  // Increment attempts
  private async incrementAttempts(userId: string, phoneNumber: string): Promise<void> {
    try {
      // Get current attempts count
      const { data: currentData } = await supabase
        .from('mobile_otp_verification')
        .select('attempts')
        .eq('user_id', userId)
        .eq('mobile_number', phoneNumber)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (currentData) {
        await supabase
          .from('mobile_otp_verification')
          .update({ attempts: (currentData.attempts || 0) + 1 })
          .eq('user_id', userId)
          .eq('mobile_number', phoneNumber)
          .eq('verified', false);
      }
    } catch (error) {
      console.error('Failed to increment attempts:', error);
    }
  }

  // Check if user can request new OTP
  async canRequestOTP(userId: string, phoneNumber: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('mobile_otp_verification')
        .select('created_at, attempts')
        .eq('user_id', userId)
        .eq('mobile_number', phoneNumber)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) return true;

      // Check if last attempt was more than 1 minute ago
      const lastAttempt = new Date(data.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastAttempt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      return minutesDiff >= 1; // Allow new OTP after 1 minute
    } catch (error) {
      return true; // If no data, allow request
    }
  }

  // Send order confirmation SMS
  async sendOrderConfirmation(phoneNumber: string, orderDetails: {
    orderId: string;
    totalAmount: number;
    items: string[];
  }): Promise<boolean> {
    const message = `Order Confirmed! Order ID: ${orderDetails.orderId}, Amount: ₹${orderDetails.totalAmount}. Items: ${orderDetails.items.join(', ')}. Thank you for choosing IoT Solutions Hub!`;
    
    return await this.sendOTP(phoneNumber, message);
  }

  // Send order status update SMS
  async sendOrderStatusUpdate(phoneNumber: string, orderId: string, status: string): Promise<boolean> {
    const statusMessages: { [key: string]: string } = {
      'confirmed': `Your order ${orderId} has been confirmed and is being processed.`,
      'processing': `Your order ${orderId} is being prepared for shipment.`,
      'shipped': `Your order ${orderId} has been shipped! Track your package with the tracking number provided.`,
      'delivered': `Your order ${orderId} has been delivered successfully. Thank you for your purchase!`,
      'cancelled': `Your order ${orderId} has been cancelled. Refund will be processed within 3-5 business days.`
    };

    const message = statusMessages[status] || `Your order ${orderId} status has been updated to: ${status}`;
    return await this.sendOTP(phoneNumber, message);
  }
}

// Create SMS service instance
const smsService = new SMSService({
  provider: (import.meta.env.VITE_TWILIO_ACCOUNT_SID && import.meta.env.VITE_TWILIO_AUTH_TOKEN && import.meta.env.VITE_TWILIO_PHONE_NUMBER) ? 'twilio' : 'demo',
  twilioAccountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  twilioAuthToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
});

export default smsService;
