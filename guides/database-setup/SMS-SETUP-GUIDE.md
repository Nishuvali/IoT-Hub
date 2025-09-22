# SMS OTP Setup Guide

## Current Status
The mobile verification is currently using **mock/demo mode** - no real SMS is being sent.

## How to Enable Real SMS OTP

### Option 1: Supabase SMS (Easiest)
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Settings**
3. Enable **Phone Authentication**
4. Configure SMS provider (Twilio, etc.)
5. Add your SMS service credentials

### Option 2: Third-Party SMS Services

#### TextLocal (Popular in India)
1. Sign up at [TextLocal](https://www.textlocal.in/)
2. Get your API key
3. Add to `.env`:
```bash
TEXTLOCAL_API_KEY=your_api_key_here
```

#### Twilio (Global)
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env`:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Option 3: Other SMS Services
- **AWS SNS**: Amazon's SMS service
- **Firebase**: Google's SMS service
- **SendGrid**: Popular email/SMS service
- **MessageBird**: European SMS service

## Implementation Steps

1. **Choose your SMS service** from the options above
2. **Sign up and get credentials** from your chosen service
3. **Add credentials to `.env`** file
4. **Deploy the API routes** (`src/api/send-otp.js` and `src/api/verify-otp.js`)
5. **Test the integration** with a real phone number

## Cost Considerations

- **TextLocal**: ₹0.15-0.30 per SMS in India
- **Twilio**: $0.0075 per SMS globally
- **AWS SNS**: $0.00645 per SMS globally
- **Firebase**: Free tier available

## Testing

For testing purposes, you can:
1. Use the mock mode (current implementation)
2. Use SMS testing services like Twilio's test numbers
3. Use your own phone number for testing

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for all credentials
- Implement rate limiting for OTP requests
- Set OTP expiration times (5-10 minutes)
- Limit failed verification attempts (3-5 attempts)
