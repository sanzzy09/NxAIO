'use server';
/**
 * @fileOverview This file defines a Genkit flow for the AI Logic Command Assistant.
 * It allows the AI to understand natural language tasks and automatically chain
 * together specific utilities (represented by Genkit tools) to accomplish them.
 *
 * - aiLogicCommandAssistant - The main function to interact with the AI assistant.
 * - AiLogicCommandAssistantInput - The input type for the assistant.
 * - AiLogicCommandAssistantOutput - The output type from the assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema: User's natural language task description
const AiLogicCommandAssistantInputSchema = z
  .string()
  .describe('A natural language description of the task the user wants to accomplish.');
export type AiLogicCommandAssistantInput = z.infer<typeof AiLogicCommandAssistantInputSchema>;

// Output Schema: AI's response, potentially incorporating results from tool calls
const AiLogicCommandAssistantOutputSchema = z
  .string()
  .describe('The AI assistant\u0027s response, detailing how it understood the request and what actions (including tool usage) it took or plans to take.');
export type AiLogicCommandAssistantOutput = z.infer<typeof AiLogicCommandAssistantOutputSchema>;

// --- Define Dummy Tools ---
// These tools simulate the functionality of the core features.
// In a real application, these would interact with actual services.

const optimizeImageTool = ai.defineTool(
  {
    name: 'optimizeImage',
    description: 'Optimizes an image for web and social media, including compression, resizing, and cropping. Use this tool when the user mentions "optimize image", "compress photo", "crop picture", or similar image manipulation requests.',
    inputSchema: z.object({
      originalImageDescription: z.string().describe('A brief natural language description of the original image (e.g., "a product photo", "a selfie", "a banner image").'),
      targetPlatform: z.string().optional().describe('Optional: The intended social media or web platform for the optimized image (e.g., "Instagram", "Facebook", "Twitter", "website banner").'),
      optimizationGoal: z.string().optional().describe('Optional: The specific goal of optimization (e.g., "smaller file size", "better quality for social media", "fit for profile picture").'),
      cropRatio: z.string().optional().describe('Optional: Desired aspect ratio for cropping (e.g., "1:1", "4:3", "16:9").'),
    }),
    outputSchema: z.string().describe('A confirmation message indicating the image optimization process has been initiated or completed, along with any key parameters used.'),
  },
  async (input) => {
    // Simulate image optimization process
    const platformDetail = input.targetPlatform ? ` for ${input.targetPlatform}` : '';
    const goalDetail = input.optimizationGoal ? ` to achieve "${input.optimizationGoal}"` : '';
    const cropDetail = input.cropRatio ? ` with a ${input.cropRatio} crop` : '';
    return `Initiated optimization for "${input.originalImageDescription}"${platformDetail}${goalDetail}${cropDetail}. The optimized image will be ready shortly.`;
  }
);

const previewContentTool = ai.defineTool(
  {
    name: 'previewContent',
    description: 'Generates a live preview or mockup of creative content (e.g., an image, text block, UI design) on various devices or within different layouts. Use this tool when the user asks to "preview", "mockup", "see how it looks", or "generate a live view" of content.',
    inputSchema: z.object({
      contentDescription: z.string().describe('A brief natural language description of the content to be previewed (e.g., "the new logo", "the ad copy", "the webpage layout").'),
      previewContext: z.string().optional().describe('Optional: The context or environment for the preview (e.g., "on a mobile phone", "in an Instagram feed", "as a desktop website").'),
      deviceType: z.string().optional().describe('Optional: The specific device type for the preview (e.g., "iPhone 15", "Android tablet", "desktop monitor").'),
    }),
    outputSchema: z.string().describe('A confirmation message indicating that the live preview has been generated and is available for viewing, specifying the content and context.'),
  },
  async (input) => {
    // Simulate content preview generation
    const contextDetail = input.previewContext ? ` in a ${input.previewContext} context` : '';
    const deviceDetail = input.deviceType ? ` on a ${input.deviceType}` : '';
    return `Live preview for "${input.contentDescription}" generated${contextDetail}${deviceDetail}. Please check the Live Creative Previewer for details.`;
  }
);

const manageSnippetTool = ai.defineTool(
  {
    name: 'manageSnippet',
    description: 'Manages code or text snippets, including saving, retrieving, updating, or deleting them. This tool is useful when the user wants to "save code", "store text", "find a snippet", or "delete a note".',
    inputSchema: z.object({
      action: z.enum(['save', 'retrieve', 'delete', 'update']).describe('The action to perform on the snippet: "save", "retrieve", "delete", or "update".'),
      snippetName: z.string().describe('A unique name or identifier for the snippet.'),
      snippetContent: z.string().optional().describe('Optional: The content of the snippet, required for "save" or "update" actions.'),
      language: z.string().optional().describe('Optional: The programming language for syntax highlighting (e.g., "typescript", "javascript", "python", "json", "markdown").'),
      description: z.string().optional().describe('Optional: A short description for the snippet.'),
    }),
    outputSchema: z.string().describe('A confirmation message detailing the outcome of the snippet management action (e.g., "Snippet saved successfully", "Snippet retrieved").'),
  },
  async (input) => {
    // Simulate snippet management
    switch (input.action) {
      case 'save':
        if (!input.snippetContent) {
          return `Error: Cannot save snippet "${input.snippetName}" without content.`;
        }
        return `Snippet "${input.snippetName}" (${input.language || 'plain text'}) saved successfully. Description: "${input.description || 'No description'}"`;
      case 'retrieve':
        // In a real app, this would fetch actual snippet content.
        return `Retrieved snippet "${input.snippetName}". Content: 'console.log("Hello, World!"); // Simulated content'`;
      case 'delete':
        return `Snippet "${input.snippetName}" deleted successfully.`;
      case 'update':
        if (!input.snippetContent) {
          return `Error: Cannot update snippet "${input.snippetName}" without new content.`;
        }
        return `Snippet "${input.snippetName}" updated successfully. New content: "${input.snippetContent?.substring(0, 50)}..."`;
      default:
        return `Invalid snippet management action: ${input.action}.`;
    }
  }
);

// --- Define the Prompt ---
const aiLogicCommandAssistantPrompt = ai.definePrompt({
  name: 'aiLogicCommandAssistantPrompt',
  input: { schema: AiLogicCommandAssistantInputSchema },
  output: { schema: AiLogicCommandAssistantOutputSchema },
  tools: [optimizeImageTool, previewContentTool, manageSnippetTool],
  system: `You are NxAIO, an intelligent AI assistant. Your goal is to understand the user's task described in natural language and leverage available utilities (tools) to fulfill it.\n\nWhen a user describes a task:\n1. Identify the core intent and what utility or chain of utilities would best accomplish it.\n2. If a tool is appropriate, call the tool with the necessary parameters extracted from the user's request.\n3. If multiple tools are needed in sequence (chaining), outline the steps you will take and then call the first tool.\n4. If no specific tool is suitable, respond by asking for clarification or explaining what you can do.\n5. Always provide a clear, helpful, and concise response to the user, summarizing the action taken or the plan.\n\nAvailable utilities (tools):\n- optimizeImage: For image optimization (compression, cropping).\n- previewContent: For generating live mockups of content.\n- manageSnippet: For saving, retrieving, updating, or deleting code/text snippets.`,
  prompt: `User Task: {{{.}}}`, // The user's input will be passed directly as the prompt body.
});

// --- Define the Flow ---
const aiLogicCommandAssistantFlow = ai.defineFlow(
  {
    name: 'aiLogicCommandAssistantFlow',
    inputSchema: AiLogicCommandAssistantInputSchema,
    outputSchema: AiLogicCommandAssistantOutputSchema,
  },
  async (input) => {
    // The prompt execution will automatically handle tool calling based on the model's decision.
    const { output } = await aiLogicCommandAssistantPrompt(input);
    if (!output) {
      throw new Error('AI assistant did not provide a response.');
    }
    return output;
  }
);

// --- Exported Wrapper Function ---
/**
 * Processes a natural language task description using the AI Logic Command Assistant.
 * The AI will attempt to understand the user's intent and automatically use
 * available tools to accomplish the task.
 *
 * @param input - A natural language description of the task.
 * @returns A promise that resolves to the AI assistant's response.
 */
export async function aiLogicCommandAssistant(
  input: AiLogicCommandAssistantInput
): Promise<AiLogicCommandAssistantOutput> {
  return aiLogicCommandAssistantFlow(input);
}
