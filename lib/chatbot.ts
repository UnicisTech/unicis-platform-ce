import OpenAI from 'openai';
import env from './env';

const openai = new OpenAI({
  baseURL:
    'https://llama-3-8b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1',
  apiKey: env.ai.llamaToken,
  dangerouslyAllowBrowser: true,
});

export { openai };
