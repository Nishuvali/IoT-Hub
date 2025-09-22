// Email Notification Service
import { supabase } from '../utils/supabase/client';

interface EmailConfig {
  provider: 'nodemailer' | 'sendgrid' | 'demo';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  fromName?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Send email
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'nodemailer':
          return await this.sendViaNodemailer(to, template);
        case 'sendgrid':
          return await this.sendViaSendGrid(to, template);
        case 'demo':
          return await this.sendViaDemo(to, template);
        default:
          throw new Error('Invalid email provider');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Nodemailer implementation
  private async sendViaNodemailer(to: string, template: EmailTemplate): Promise<boolean> {
    // This would typically be handled by the backend
    // For now, we'll simulate it
    console.log('Nodemailer email:', { to, template });
    return true;
  }

  // SendGrid implementation
  private async sendViaSendGrid(to: string, template: EmailTemplate): Promise<boolean> {
    // SendGrid API implementation would go here
    console.log('SendGrid email:', { to, template });
    return true;
  }

  // Demo implementation
  private async sendViaDemo(to: string, template: EmailTemplate): Promise<boolean> {
    console.log('📧 DEMO EMAIL SENT:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${template.subject}`);
    console.log(`Content: ${template.text}`);
    console.log('---');
    return true;
  }

  // Order confirmation email
  async sendOrderConfirmation(orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    totalAmount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: any;
  }): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: this.getOrderConfirmationHTML(orderData),
      text: this.getOrderConfirmationText(orderData)
    };

    return await this.sendEmail(orderData.customerEmail, template);
  }

  // Order status update email
  async sendOrderStatusUpdate(orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    status: string;
    trackingNumber?: string;
    courierName?: string;
  }): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Order Update - ${orderData.orderId}`,
      html: this.getOrderStatusUpdateHTML(orderData),
      text: this.getOrderStatusUpdateText(orderData)
    };

    return await this.sendEmail(orderData.customerEmail, template);
  }

  // Welcome email for new users
  async sendWelcomeEmail(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Welcome to IoT Solutions Hub!',
      html: this.getWelcomeEmailHTML(userData),
      text: this.getWelcomeEmailText(userData)
    };

    return await this.sendEmail(userData.email, template);
  }

  // Password reset email
  async sendPasswordResetEmail(userData: {
    email: string;
    firstName: string;
    resetToken: string;
  }): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${userData.resetToken}`;
    
    const template: EmailTemplate = {
      subject: 'Password Reset - IoT Solutions Hub',
      html: this.getPasswordResetHTML(userData, resetUrl),
      text: this.getPasswordResetText(userData, resetUrl)
    };

    return await this.sendEmail(userData.email, template);
  }

  // Email templates
  private getOrderConfirmationHTML(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-weight: bold; font-size: 18px; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IoT Solutions Hub</h1>
            <h2>Order Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear ${orderData.customerName},</p>
            <p>Thank you for your order! We're excited to fulfill your IoT needs.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
              
              <h4>Items Ordered:</h4>
              ${orderData.items.map((item: any) => `
                <div class="item">
                  <span>${item.name} (Qty: ${item.quantity})</span>
                  <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="item total">
                <span>Total Amount</span>
                <span>₹${orderData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Shipping Address</h3>
              <p>${orderData.shippingAddress.name}</p>
              <p>${orderData.shippingAddress.address}</p>
              <p>${orderData.shippingAddress.city} - ${orderData.shippingAddress.postalCode}</p>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>IoT Solutions Hub - Your Trusted IoT Partner</p>
            <p>Email: support@iotsolutions.com | Phone: +91 98765 43210</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOrderConfirmationText(orderData: any): string {
    return `
Order Confirmation - IoT Solutions Hub

Dear ${orderData.customerName},

Thank you for your order! We're excited to fulfill your IoT needs.

Order Details:
- Order ID: ${orderData.orderId}
- Order Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderData.items.map((item: any) => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total Amount: ₹${orderData.totalAmount.toFixed(2)}

Shipping Address:
${orderData.shippingAddress.name}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city} - ${orderData.shippingAddress.postalCode}

We'll send you another email when your order ships.
If you have any questions, please contact our support team.

IoT Solutions Hub - Your Trusted IoT Partner
Email: support@iotsolutions.com | Phone: +91 98765 43210
    `;
  }

  private getOrderStatusUpdateHTML(orderData: any): string {
    const statusMessages: { [key: string]: string } = {
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'Your order is being prepared for shipment.',
      'shipped': 'Your order has been shipped!',
      'delivered': 'Your order has been delivered successfully!',
      'cancelled': 'Your order has been cancelled.'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .status { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .tracking { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IoT Solutions Hub</h1>
            <h2>Order Update</h2>
          </div>
          <div class="content">
            <p>Dear ${orderData.customerName},</p>
            
            <div class="status">
              <h3>Order Status: ${orderData.status.toUpperCase()}</h3>
              <p>${statusMessages[orderData.status] || `Your order status has been updated to: ${orderData.status}`}</p>
            </div>
            
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            
            ${orderData.trackingNumber ? `
              <div class="tracking">
                <h4>Tracking Information</h4>
                <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
                ${orderData.courierName ? `<p><strong>Courier:</strong> ${orderData.courierName}</p>` : ''}
              </div>
            ` : ''}
            
            <p>Thank you for choosing IoT Solutions Hub!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOrderStatusUpdateText(orderData: any): string {
    const statusMessages: { [key: string]: string } = {
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'Your order is being prepared for shipment.',
      'shipped': 'Your order has been shipped!',
      'delivered': 'Your order has been delivered successfully!',
      'cancelled': 'Your order has been cancelled.'
    };

    return `
Order Update - IoT Solutions Hub

Dear ${orderData.customerName},

Your order status has been updated:

Order ID: ${orderData.orderId}
Status: ${orderData.status.toUpperCase()}
${statusMessages[orderData.status] || `Your order status has been updated to: ${orderData.status}`}

${orderData.trackingNumber ? `
Tracking Information:
- Tracking Number: ${orderData.trackingNumber}
${orderData.courierName ? `- Courier: ${orderData.courierName}` : ''}
` : ''}

Thank you for choosing IoT Solutions Hub!

IoT Solutions Hub - Your Trusted IoT Partner
Email: support@iotsolutions.com | Phone: +91 98765 43210
    `;
  }

  private getWelcomeEmailHTML(userData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to IoT Solutions Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .feature { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to IoT Solutions Hub!</h1>
          </div>
          <div class="content">
            <p>Dear ${userData.firstName} ${userData.lastName},</p>
            <p>Welcome to IoT Solutions Hub - your one-stop destination for IoT components and ready-made projects!</p>
            
            <div class="features">
              <div class="feature">
                <h3>🔧 IoT Components</h3>
                <p>Premium Arduino, ESP32, sensors, and more</p>
              </div>
              <div class="feature">
                <h3>💻 Ready-Made Projects</h3>
                <p>CSE, AI/ML, Cybersecurity projects</p>
              </div>
            </div>
            
            <p>Get started by browsing our products and don't hesitate to contact us if you need any assistance.</p>
            <p>Happy building!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailText(userData: any): string {
    return `
Welcome to IoT Solutions Hub!

Dear ${userData.firstName} ${userData.lastName},

Welcome to IoT Solutions Hub - your one-stop destination for IoT components and ready-made projects!

What we offer:
- IoT Components: Premium Arduino, ESP32, sensors, and more
- Ready-Made Projects: CSE, AI/ML, Cybersecurity projects

Get started by browsing our products and don't hesitate to contact us if you need any assistance.

Happy building!

IoT Solutions Hub - Your Trusted IoT Partner
Email: support@iotsolutions.com | Phone: +91 98765 43210
    `;
  }

  private getPasswordResetHTML(userData: any, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Dear ${userData.firstName},</p>
            <p>We received a request to reset your password for your IoT Solutions Hub account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetText(userData: any, resetUrl: string): string {
    return `
Password Reset Request - IoT Solutions Hub

Dear ${userData.firstName},

We received a request to reset your password for your IoT Solutions Hub account.

To reset your password, click the link below:
${resetUrl}

If you didn't request this password reset, please ignore this email.
This link will expire in 24 hours.

IoT Solutions Hub - Your Trusted IoT Partner
Email: support@iotsolutions.com | Phone: +91 98765 43210
    `;
  }
}

// Create email service instance
const emailService = new EmailService({
  provider: 'demo', // Change to 'nodemailer' or 'sendgrid' for production
  // Add your credentials here for production
  // smtpHost: process.env.SMTP_HOST,
  // smtpPort: process.env.SMTP_PORT,
  // smtpUser: process.env.SMTP_USER,
  // smtpPass: process.env.SMTP_PASS,
  // fromEmail: process.env.FROM_EMAIL,
  // fromName: process.env.FROM_NAME,
});

export default emailService;
