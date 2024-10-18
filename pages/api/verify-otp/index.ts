import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phoneNumber, otp } = req.body;

    try {
      // Verify OTP using Twilio
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SID!)
        .verificationChecks.create({ to: phoneNumber, code: otp });

      if (verificationCheck.status === 'approved') {
        // OTP is valid
        res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        // OTP is invalid
        console.error('OTP verification failed:', verificationCheck.status);
        res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}