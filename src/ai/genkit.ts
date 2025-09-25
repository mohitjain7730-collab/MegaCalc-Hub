import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Instruct the model to produce structured JSON output.
      supportedGenerators: {
        'gemini-2.5-flash': {
          json: true,
        },
      },
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
