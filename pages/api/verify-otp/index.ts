import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import { supabase } from '../../../lib/supabase';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phoneNumber, otp, role } = req.body;
    console.log('Received OTP verification request:', { phoneNumber, otp, role });

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SID!)
        .verificationChecks.create({ to: phoneNumber, code: otp });

      console.log('Twilio verification result:', verificationCheck.status);

      if (verificationCheck.status === 'approved') {
        const { data, error } = await supabase
          .from('otp')
          .select('role')
          .match({ mobile_number: phoneNumber })
          .single();

        if (error) {
          console.error('Supabase fetch error:', error);
          return res.status(500).json({ error: 'Failed to fetch role from database', details: error });
        }

        if (data?.role !== role) {
          return res.status(400).json({ error: 'Role mismatch' });
        }

        console.log('Verified role from Supabase:', data?.role);

        return res.status(200).json({ message: 'OTP verified successfully', role: data?.role });
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