import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isPrismaError } from '@/lib/errors';
import { openai } from '@/lib/chatbot';
import { getTeamAccess } from '@/lib/teams';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    if (isPrismaError(error)) {
      return res.status(status).json({ error: 'Prisma Error' });
    }

    res.status(status).json({ error: { message } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const access = await getTeamAccess(req, res, req.query);
  if (!access) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  if (access.plan === 'COMMUNITY') {
    return res.status(403).json({
      error: { message: 'AI Chatbot is not available on the Community plan.' },
    });
  }

  const messages = req.body;
  const model = env.ai.model;

  if (!model) {
    return res.status(500).json({
      error: { message: 'AI model is not configured. Please set AI_MODEL.' },
    });
  }

  // TODO: maybe it make sence to create separete file in models/ folder,
  // and preconfigured functions like createCompletions(message)
  const completion = await openai.chat.completions.create({
    max_tokens: 512,
    messages: messages,
    model,
    temperature: 0,
  });

  const chatbotResponse = completion.choices[0].message;

  res.status(200).json({
    data: {
      response: chatbotResponse,
    },
  });
};
