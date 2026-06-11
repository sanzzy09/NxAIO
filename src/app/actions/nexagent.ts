
'use server';

import OpenAI from 'openai';
import { initMailbox } from './temp-mail';
import { createMusicJob } from './remusic';
import { vidboxSearch } from './vidbox';
import { fetchAnichin } from './anichin';

/**
 * NexAgent Server Action
 * Handles chat interactions via OpenRouter and processes tool calls.
 */

const MODEL = "meta-llama/llama-3.1-8b-instruct:free";

// Define tools available to the AI
const tools = [
  {
    type: 'function',
    function: {
      name: 'generate_temp_mail',
      description: 'Generates a new temporary email address for the user.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_music',
      description: 'Creates a new AI music generation job based on a prompt.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Musical style and vibe description' },
          title: { type: 'string', description: 'Title for the track' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_media',
      description: 'Searches for movies and TV series in the Vidbox database.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Movie or series title' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_anime',
      description: 'Searches for anime in the Anichin database.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Anime title' }
        },
        required: ['query']
      }
    }
  }
];

export async function nexAgentChat(messages: any[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      role: "assistant",
      content: "System configuration missing: OpenRouter API key is not set. Please add OPENROUTER_API_KEY to your environment variables."
    };
  }

  // Initialize client inside function to ensure fresh env vars
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://nxaio.app",
      "X-Title": "NxAIO NexAgent",
    }
  });

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are NexAgent, the intelligent orchestrator of NxAIO. You help users manage their utilities. You can generate temp mail, create music, and search for anime or movies. Be concise, helpful, and premium in your tone. If a user asks for something you have a tool for, use the tool. Always respond in plain text or markdown, do not use JSON blocks for the final user response."
        },
        ...messages
      ],
      tools: tools as any,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults: any[] = [];
      
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result: any;

        try {
          switch (functionName) {
            case 'generate_temp_mail':
              result = await initMailbox();
              break;
            case 'generate_music':
              result = await createMusicJob({ prompt: args.prompt, title: args.title, mode: 'simple' });
              break;
            case 'search_media':
              result = await vidboxSearch(args.query);
              break;
            case 'search_anime':
              result = await fetchAnichin({ mode: 'search', query: args.query });
              break;
            default:
              result = { status: false, error: 'Tool not implemented.' };
          }
        } catch (e: any) {
          result = { status: false, error: e.message };
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result),
        });
      }

      // Get final response after tools
      const finalResponse = await client.chat.completions.create({
        model: MODEL,
        messages: [
          ...messages,
          message,
          ...toolResults
        ]
      });

      return {
        role: "assistant",
        content: finalResponse.choices[0].message.content,
        toolCalls: message.tool_calls
      };
    }

    return {
      role: "assistant",
      content: message.content
    };

  } catch (error: any) {
    console.error('NexAgent Chat Error:', error);
    
    // Provide user-friendly feedback for common API errors
    if (error.status === 401) {
       return { role: "assistant", content: "Invalid OpenRouter API Key. Please verify the key in your .env configuration." };
    }
    if (error.status === 402) {
       return { role: "assistant", content: "Insufficient OpenRouter balance. Please check your credit status." };
    }

    return {
      role: "assistant",
      content: `I'm having trouble reaching the neural network. (Reason: ${error.message || 'Connection failure'})`
    };
  }
}
