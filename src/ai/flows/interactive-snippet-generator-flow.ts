'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating code or text snippets
 * based on a user-provided description.
 *
 * - generateSnippet - A function that handles the snippet generation process.
 * - InteractiveSnippetGeneratorInput - The input type for the generateSnippet function.
 * - InteractiveSnippetGeneratorOutput - The return type for the generateSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteractiveSnippetGeneratorInputSchema = z.object({
  promptDescription: z
    .string()
    .describe('A short description or prompt for the code or text snippet.'),
});
export type InteractiveSnippetGeneratorInput = z.infer<
  typeof InteractiveSnippetGeneratorInputSchema
>;

const InteractiveSnippetGeneratorOutputSchema = z.object({
  snippet: z.string().describe('The generated code or text snippet.'),
});
export type InteractiveSnippetGeneratorOutput = z.infer<
  typeof InteractiveSnippetGeneratorOutputSchema
>;

export async function generateSnippet(
  input: InteractiveSnippetGeneratorInput
): Promise<InteractiveSnippetGeneratorOutput> {
  return interactiveSnippetGeneratorFlow(input);
}

const snippetGeneratorPrompt = ai.definePrompt({
  name: 'snippetGeneratorPrompt',
  input: {schema: InteractiveSnippetGeneratorInputSchema},
  output: {schema: InteractiveSnippetGeneratorOutputSchema},
  prompt: `You are an expert at generating clean, concise, and relevant code or text snippets.

Based on the following description, generate a code or text snippet that directly addresses the request. Focus on providing only the snippet, without extra conversational text or explanations.

Description: {{{promptDescription}}}`,
});

const interactiveSnippetGeneratorFlow = ai.defineFlow(
  {
    name: 'interactiveSnippetGeneratorFlow',
    inputSchema: InteractiveSnippetGeneratorInputSchema,
    outputSchema: InteractiveSnippetGeneratorOutputSchema,
  },
  async input => {
    const {output} = await snippetGeneratorPrompt(input);
    return output!;
  }
);
