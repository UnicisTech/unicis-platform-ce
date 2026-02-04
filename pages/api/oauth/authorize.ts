import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!env.teamFeatures.sso) {
    res.status(404).json({ error: { message: 'Not Found' } });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
      case 'POST':
        await handleAuthorize(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;
    res.status(status).json({ error: { message } });
  }
}

const handleAuthorize = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const requestParams = req.method === 'GET' ? req.query : req.body;

  const { redirect_url, authorize_form } =
    await oauthController.authorize(requestParams);

  if (redirect_url) {
    res.redirect(302, redirect_url);
  } else {
    // Defensive sanitization for upstream HTML response.
    const sanitizedForm = String(authorize_form)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');

    res.setHeader(
      'Content-Security-Policy',
      "script-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';"
    );
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(sanitizedForm);
  }
};
