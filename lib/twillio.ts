import twilio from 'twilio';

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioVerifySid = process.env.TWILIO_VERIFY_SID;

if (!twilioAccountSid) {
  throw new Error('Missing TWILIO_ACCOUNT_SID environment variable');
}

if (!twilioAuthToken) {
  throw new Error('Missing TWILIO_AUTH_TOKEN environment variable');
}

if (!twilioVerifySid) {
  throw new Error('Missing TWILIO_VERIFY_SID environment variable');
}

export const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
export const twilioVerify = twilioClient.verify.v2.services(twilioVerifySid);