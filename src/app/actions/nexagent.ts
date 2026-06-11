
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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "sk-or-v1-43577583643758364375836"; // Placeholder if not set
const MODEL = "meta-llama/llama-3.1-8b-instruct:free";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://nxaio.app", // Optional, for OpenRouter tracking
    "X-Title": "NxAIO NexAgent",
  }
});

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
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are NexAgent, the intelligent orchestrator of NxAIO. You help users manage their utilities. You can generate temp mail, create music, and search for anime or movies. Be concise, helpful, and premium in your tone. If a user asks for something you have a tool for, use the tool."
        },
        ...messages
      ],
      tools: tools as any,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls) {
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
        toolCalls: message.tool_calls // To show in UI
      };
    }

    return {
      role: "assistant",
      content: message.content
    };

  } catch (error: any) {
    console.error('NexAgent Chat Error:', error.message);
    return {
      role: "assistant",
      content: "I'm having trouble reaching the neural network. Please check your OpenRouter configuration."
    };
  }
}
