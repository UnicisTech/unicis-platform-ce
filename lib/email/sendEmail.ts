import env from "../env";
import nodemailer from "nodemailer";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },
  });

  const emailDefaults = {
    from: env.smtp.from,
  };

  await transporter.sendMail({ ...emailDefaults, ...data });
};
