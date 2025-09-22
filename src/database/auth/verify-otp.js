// API route for verifying OTP
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  try {
    // Check stored OTP
    const storedData = global.otpStore?.get(phone);
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or not found. Please request a new one.' 
      });
    }

    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedData.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      global.otpStore?.delete(phone);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }

    // Check attempt limit
    if (storedData.attempts >= 3) {
      global.otpStore?.delete(phone);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedData.otp === otp) {
      // OTP is correct, clean up
      global.otpStore?.delete(phone);
      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      // Increment failed attempts
      storedData.attempts++;
      global.otpStore?.set(phone, storedData);
      
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please try again.' 
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Verification failed. Please try again.' 
    });
  }
}
