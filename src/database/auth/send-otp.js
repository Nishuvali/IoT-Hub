// API route for sending OTP via third-party SMS service
// This is a server-side function that can be deployed to Vercel, Netlify, etc.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Option 1: TextLocal SMS Service (India)
    const textLocalResponse = await sendViaTextLocal(phone);
    
    if (textLocalResponse.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully',
        otp: textLocalResponse.otp // For testing - remove in production
      });
    }

    // Option 2: Twilio SMS Service (Global)
    const twilioResponse = await sendViaTwilio(phone);
    
    if (twilioResponse.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully',
        otp: twilioResponse.otp // For testing - remove in production
      });
    }

    throw new Error('All SMS services failed');

  } catch (error) {
    console.error('SMS sending error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
}

// TextLocal SMS Service (Popular in India)
async function sendViaTextLocal(phone) {
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const response = await fetch('https://api.textlocal.in/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: process.env.TEXTLOCAL_API_KEY, // Add to your .env
        numbers: phone,
        message: `Your OTP for IoT Hub verification is ${OTP}. Valid for 5 minutes.`,
        sender: 'TXTLCL' // Your sender ID
      })
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      // Store OTP in database or cache for verification
      await storeOTP(phone, OTP);
      return { success: true, otp: OTP };
    } else {
      throw new Error(data.errors?.[0]?.message || 'TextLocal SMS failed');
    }
  } catch (error) {
    console.error('TextLocal error:', error);
    return { success: false, error: error.message };
  }
}

// Twilio SMS Service (Global)
async function sendViaTwilio(phone) {
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID; // Add to your .env
    const authToken = process.env.TWILIO_AUTH_TOKEN;   // Add to your .env
    const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Add to your .env

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: `Your OTP for IoT Hub verification is ${OTP}. Valid for 5 minutes.`
      })
    });

    const data = await response.json();
    
    if (data.status === 'queued' || data.status === 'sent') {
      // Store OTP in database or cache for verification
      await storeOTP(phone, OTP);
      return { success: true, otp: OTP };
    } else {
      throw new Error(data.error_message || 'Twilio SMS failed');
    }
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false, error: error.message };
  }
}

// Store OTP for verification (you can use Redis, database, or memory cache)
async function storeOTP(phone, otp) {
  // For demo purposes, we'll use a simple in-memory store
  // In production, use Redis or database
  global.otpStore = global.otpStore || new Map();
  global.otpStore.set(phone, {
    otp: otp,
    timestamp: Date.now(),
    attempts: 0
  });
  
  // Auto-expire after 5 minutes
  setTimeout(() => {
    global.otpStore?.delete(phone);
  }, 5 * 60 * 1000);
}
