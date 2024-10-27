import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(req: Request) {
  const { phoneNumber, otp, role } = await req.json();

  if (!phoneNumber || !otp) {
    return NextResponse.json({ 
      error: 'Phone number and OTP are required' 
    }, { status: 400 });
  }

  try {
    // Find the most recent valid OTP for the phone number
    const { data: otpEntry, error: fetchError } = await supabase
      .from('otp')
      .select('*')
      .eq('mobile_number', phoneNumber)
      .eq('is_verified', false)  // Only get unverified OTPs
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpEntry) {
      return NextResponse.json({ 
        error: 'No valid OTP found or OTP has expired' 
      }, { status: 400 });
    }

    if (otpEntry.otp !== otp) {
      return NextResponse.json({ 
        error: 'Invalid OTP' 
      }, { status: 400 });
    }

    // Delete all expired and unverified OTPs for this phone number
    const { error: deleteError } = await supabase
      .from('otp')
      .delete()
      .eq('mobile_number', phoneNumber)
      .eq('is_verified', false)
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      console.error('Error cleaning up expired OTPs:', deleteError);
      // Continue execution as this is not critical
    }

    // Update the OTP entry as verified
    const { data: userData, error: updateError } = await supabase
      .from('otp')
      .update({
        role: role?.toLowerCase() || otpEntry.role,
        is_verified: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Set expiry to 1 year
      })
      .eq('id', otpEntry.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user record:', updateError);
      return NextResponse.json({
        error: 'User update failed, please try again',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      user: userData,
      verified: true
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ 
      error: 'Failed to verify OTP',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}