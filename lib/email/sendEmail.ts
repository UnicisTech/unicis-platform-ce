import nodemailer from 'nodemailer';
import env from '../env';

const isEdge = typeof (globalThis as any).EdgeRuntime !== 'undefined';
if (isEdge) {
  throw new Error('Nodemailer does not support Edge Runtime.');
}

const envProbe = {
  SMTP_HOST: !!env.smtp.host,
  SMTP_PORT: env.smtp.port,
  SMTP_USER: !!env.smtp.user,
  SMTP_PASS: env.smtp.password ? '***' : false,
  MAIL_FROM: env.smtp.from,
};
console.log('[mail] env probe:', envProbe);

const secure =
  String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' ||
  Number(env.smtp.port) === 465;

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
  logger: String(process.env.SMTP_DEBUG || '').toLowerCase() === 'true',
  debug: String(process.env.SMTP_DEBUG || '').toLowerCase() === 'true',
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!env.smtp.host) {
    console.error('[mail] Missing SMTP host — skipping send');
    return;
  }

  try {
    await transporter.verify();
  } catch (e: any) {
    console.error('[mail] transporter.verify() failed', {
      message: e?.message,
      code: e?.code,
      command: e?.command,
      response: e?.response,
      responseCode: e?.responseCode,
    });
    throw e;
  }

  const emailDefaults = { from: env.smtp.from };

  try {
    const info = await transporter.sendMail({ ...emailDefaults, ...data });
    console.log('[mail] sent', { id: info.messageId, response: info.response });
    return info;
  } catch (e: any) {
    console.error('[mail] sendMail failed', {
      message: e?.message,
      code: e?.code,
      command: e?.command,
      response: e?.response,
      responseCode: e?.responseCode,
    });
    throw e;
  }
};

// import nodemailer from 'nodemailer';

// import env from '../env';

// const transporter = nodemailer.createTransport({
//   host: env.smtp.host,
//   port: env.smtp.port,
//   secure: false,
//   auth: {
//     user: env.smtp.user,
//     pass: env.smtp.password,
//   },
// });

// interface EmailData {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
// }

// export const sendEmail = async (data: EmailData) => {
//   if (!env.smtp.host) {
//     return;
//   }

//   const emailDefaults = {
//     from: env.smtp.from,
//   };

//   return await transporter.sendMail({ ...emailDefaults, ...data });
// };
