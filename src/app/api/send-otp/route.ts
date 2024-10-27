import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import twilio from 'twilio';

export async function POST(request: Request) {
  const { phoneNumber, role } = await request.json();

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to Supabase
    const { data, error } = await supabase.from('otp').insert({
      mobile_number: phoneNumber,
      otp: otp,
      role: role?.toLowerCase(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes expiry
      is_verified: false,
    });

    if (error) {
      console.error('Error saving OTP:', error);
      return NextResponse.json({ error: 'Failed to save OTP' }, { status: 500 });
    }

    // Integrate with Twilio if environment variables are set
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilioClient.messages.create({
        body: `Your OTP is: ${otp}`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    } else {
      console.warn("Twilio environment variables are not fully set. Skipping SMS sending.");
    }

    // Return OTP in dev mode for testing, hidden in production
    return NextResponse.json({
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      {
        error: 'Failed to send OTP',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
