
'use server';

import OpenAI from 'openai';
import { initMailbox } from './temp-mail';
import { createMusicJob } from './remusic';
import { vidboxSearch } from './vidbox';
import { fetchAnichin } from './anichin';

/**
 * NexAgent Server Action
 * Handles chat interactions via OpenRouter and processes tool calls.
 * Enhanced system prompt for visual "Card" responses using Markdown.
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
You are NexAgent, the premium AI orchestrator for NxAIO. Your goal is to deliver high-fidelity, visual responses using Markdown. 

MANDATORY PROTOCOL: DO NOT USE CODE BLOCKS (triple backticks) to display cards or data. Generate the Markdown directly so it renders as UI elements.

VISUAL OUTPUT PROTOCOLS:
1. **Media Responses (Movies/Anime)**:
   - FORMAT AS A VISUAL CARD (Direct Markdown, NO CODE BLOCKS):
   - Always start with the title in an H3 header: ### [Judul]
   - If a poster URL is provided, display it prominently: ![Poster](url)
   - Below the poster, list details in this exact clean format:
     - **Tahun**: [Year]
     - **Tipe**: [Type]
     - **Rating**: ⭐ [Rating]
     - **Sinopsis**: [Brief Summary]
     - [▶️ Nonton Sekarang](URL)
   - Use a horizontal divider (---) to separate multiple results.

2. **Music Generation**:
   - Format the response like a "Composition Ticket".
   - Bold the **Title** and **Prompt**.
   - Use a bulleted list for **Styles**.

3. **General Data**:
   - Use **Bold** for technical identifiers, emails, or codes.
   - Use horizontal dividers (---) to separate distinct logic steps.

4. **Tone**: Premium, technical, and concise. Respond in Indonesian for media results.
`;

  try {
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: systemInstructions },
        ...messages.map(m => ({ role: m.role, content: m.content }))
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
          ...messages.map(m => ({ role: m.role, content: m.content })),
          message,
          ...toolResults
        ]
      });

      // Clean the final response to be serializable
      return {
        role: "assistant",
        content: finalResponse.choices[0].message.content || "Request processed.",
        toolCalls: message.tool_calls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }))
      };
    }

    return {
      role: "assistant",
      content: message.content || "I'm not sure how to respond to that."
    };

  } catch (error: any) {
    console.error('NexAgent Chat Error:', error);
    return {
      role: "assistant",
      content: `I'm having trouble reaching the neural network. (Reason: ${error.message || 'Connection failure'})`
    };
  }
}
