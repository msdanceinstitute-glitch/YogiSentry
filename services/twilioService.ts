import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);

export const TwilioService = {
  async sendSMS(to: string, message: string) {
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
    } catch (err) {
      console.error("Twilio Error:", err);
    }
  }
};
