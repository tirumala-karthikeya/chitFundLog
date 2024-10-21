import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import { supabase } from '../../../lib/supabase';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phoneNumber, otp, role } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !otp || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: {
          phoneNumber: !phoneNumber ? 'Phone number is required' : null,
          otp: !otp ? 'OTP is required' : null,
          role: !role ? 'Role is required' : null
        }
      });
    }

    console.log('Received OTP verification request:', { phoneNumber, otp, role });

    try {
      // Check for recent OTP entry
      const { data: otpEntry, error: otpFetchError } = await supabase
        .from('otp')
        .select('*')
        .eq('mobile_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpFetchError && otpFetchError.code !== 'PGRST116') {
        console.error('Error fetching OTP entry:', otpFetchError);
        return res.status(500).json({ error: 'Failed to verify OTP entry' });
      }

      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SID!)
        .verificationChecks.create({ to: phoneNumber, code: otp });

      console.log('Twilio verification result:', verificationCheck.status);

      if (verificationCheck.status === 'approved') {
        const normalizedRole = role.toLowerCase();
        
        // Update OTP entry
        const { data: updatedEntry, error: updateError } = await supabase
          .from('otp')
          .update({
            role: normalizedRole,
            is_verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('mobile_number', phoneNumber)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating OTP entry:', updateError);
          return res.status(500).json({ 
            error: 'Failed to update verification status', 
            details: updateError 
          });
        }

        console.log('Updated Supabase entry:', updatedEntry);

        // Optional: Update user record
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert({
              phone_number: phoneNumber,
              role: normalizedRole,
              last_verified_at: new Date().toISOString()
            }, {
              onConflict: 'phone_number',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (userError) {
            console.warn('Warning: Failed to update user record:', userError);
          } else {
            console.log('User record updated:', userData);
          }
        } catch (userError) {
          console.warn('Warning: Error updating user record:', userError);
        }

        return res.status(200).json({ 
          message: 'OTP verified successfully',
          role: normalizedRole,
          verified: true,
          data: updatedEntry,
          redirect: '/',
          shouldRedirect: true 
        });
      } else {
        console.error('OTP verification failed:', verificationCheck.status);
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ error: 'Failed to verify OTP', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
