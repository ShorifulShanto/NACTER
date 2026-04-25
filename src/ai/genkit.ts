import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyDfCMcJyQxYun1G9q6B2QqKGBmO2Gq5lNQ',
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});