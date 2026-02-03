import OpenAI from 'openai';
import env from './env';

const openai = new OpenAI({
  baseURL: env.ai.url,
  apiKey: env.ai.llamaToken,
  dangerouslyAllowBrowser: true,
});

export { openai };
