import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isPrismaError } from '@/lib/errors';
import { throwIfNoTeamAccess } from 'models/team';
import { openai } from '@/lib/chatbot';

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

  await throwIfNoTeamAccess(req, res);

  const messages = req.body;

  // TODO: maybe it make sence to create separete file in models/ folder,
  // and preconfigured functions like createCompletions(message)
  const completion = await openai.chat.completions.create({
    max_tokens: 512,
    messages: messages,
    model: 'Meta-Llama-3-8B-Instruct',
    temperature: 0,
  });

  const chatbotResponse = completion.choices[0].message;

  res.status(200).json({
    data: {
      response: chatbotResponse,
    },
  });
};
