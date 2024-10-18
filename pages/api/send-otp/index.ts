// pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { twilioClient } from '../../../lib/twillio';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phoneNumber } = req.body;

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP to Supabase
      const { data, error } = await supabase
        .from('otp')
        .insert({
          mobile_number: phoneNumber,
          otp: otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // OTP expires in 10 minutes
        });

      if (error) throw error;

      // Send OTP via Twilio Verify
      const twilioVerifySid = process.env.TWILIO_VERIFY_SID as string;
      await twilioClient.verify.v2.services(twilioVerifySid)
        .verifications
        .create({
          to: phoneNumber,
          channel: 'sms',
        });

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}