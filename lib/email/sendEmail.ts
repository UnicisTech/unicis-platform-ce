import { Resend } from 'resend';
import env from '../env';

const resend = new Resend(env.resend.apiKey);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    const response = await resend.emails.send({
      from: env.resend.from,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};