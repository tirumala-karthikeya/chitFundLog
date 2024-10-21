import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { twilioClient } from '../../../lib/twillio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phoneNumber, role } = req.body;
    console.log('Received OTP request:', { phoneNumber, role });

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      if (role && (role.toLowerCase() === 'owner' || role.toLowerCase() === 'participant')) {
        const insertData = {
          mobile_number: phoneNumber,
          otp: otp,
          role: role.toLowerCase(),
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // OTP expires in 10 minutes
        };
        
        console.log('Inserting data into Supabase:', insertData);

        const { data, error } = await supabase
          .from('otp')
          .insert(insertData);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('OTP and role saved to Supabase:', data);
      } else {
        console.log('Invalid or missing role. OTP will be sent but not saved to database.');
      }

      const twilioVerifySid = process.env.TWILIO_VERIFY_SID as string;
      await twilioClient.verify.v2.services(twilioVerifySid)
        .verifications
        .create({
          to: phoneNumber,
          channel: 'sms',
        });

      console.log('OTP sent successfully');
      res.status(200).json({ message: 'OTP sent successfully', role: role ? role.toLowerCase() : 'not specified' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}