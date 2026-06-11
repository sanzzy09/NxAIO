'use server';

import OpenAI from 'openai';
import { initMailbox } from './temp-mail';
import { createMusicJob } from './remusic';
import { vidboxSearch } from './vidbox';
import { fetchAnichin } from './anichin';

/**
 * NexAgent Server Action
 * Handles chat interactions via OpenRouter and processes tool calls.
 * Enhanced system prompt for rich Markdown output (tables, lists, points).
 */

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

export async function nexAgentChat(messages: any[], modelId: string = "google/gemini-2.0-flash-exp:free") {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      role: "assistant",
      content: "System configuration missing: OpenRouter API key is not set. Please ensure OPENROUTER_API_KEY is present in your environment variables."
    };
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://nxaio.app",
      "X-Title": "NxAIO NexAgent",
    }
  });

  const systemInstructions = `
You are NexAgent, the intelligent orchestrator of NxAIO. Your goal is to help users manage utilities efficiently.

RESPONSIVE PROTOCOL:
1. Always respond using high-fidelity Markdown.
2. For structured data (like movie details, search results, or email logs), USE TABLES.
3. For steps or features, USE BULLET POINTS or numbered lists.
4. Bold important technical terms, identifiers, and codes.
5. If you search for a movie/anime, provide a detailed table including Title, Year, and Rating if available.
6. Use horizontal dividers (---) to separate different sections of a complex response.
7. Maintain a premium, helpful, and engineering-focused tone.
8. If a tool call fails, explain why clearly in a formatted block.

Available Tools:
- generate_temp_mail: Provision a new disposable inbox.
- generate_music: Start an AI composition job.
- search_media: Find movies/TV in Vidbox database.
- search_anime: Query Anichin archives.

RESPONSE STYLE EXAMPLE:
### Movie Search Result: "Inception"
| Detail | Value |
| :--- | :--- |
| **Title** | Inception |
| **Year** | 2010 |
| **Rating** | 8.8/10 |

**Status**: Ready for streaming on Vidsrc mirror.
---
Would you like me to find similar sci-fi titles?
`;

  try {
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: systemInstructions },
        ...messages
      ],
      tools: tools as any,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

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

      const finalResponse = await client.chat.completions.create({
        model: modelId,
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
    return {
      role: "assistant",
      content: `I'm having trouble reaching the neural network. (Reason: ${error.message || 'Connection failure'})`
    };
  }
}
