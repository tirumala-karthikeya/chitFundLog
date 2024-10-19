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
        // OTP is valid, update the role in the database
        const updateData = { role: role.toLowerCase() };
        console.log('Updating Supabase with:', updateData);

        const { data, error } = await supabase
          .from('otp')
          .update(updateData)
          .match({ mobile_number: phoneNumber });

        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ error: 'Failed to update role in database', details: error });
        }

        console.log('Supabase update result:', data);

        return res.status(200).json({ message: 'OTP verified successfully and role updated', role: role.toLowerCase() });
      } else {
        // OTP is invalid (unchanged)
        console.error('OTP verification failed:', verificationCheck.status);
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    } catch (error) {
      // Error handling (unchanged)
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ error: 'Failed to verify OTP', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    // Method not allowed handling (unchanged)
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
