'use server';

import OpenAI from 'openai';
import { initMailbox, checkMessages } from './temp-mail';
import { createMusicJob, pollMusicStatus } from './remusic';
import { vidboxSearch } from './vidbox';
import { fetchAnichin } from './anichin';
import { removeImageBackground } from './remove-bg';
import { fetchKomiku } from './komiku';
import { siteConfig } from '@/config/site';

/**
 * NexAgent Server Action
 * Handles chat interactions via OpenRouter and processes tool calls.
 */

const tools = [
  {
    type: 'function',
    function: {
      name: 'generate_temp_mail',
      description: 'Provision a disposable identity session with real-time mailbox monitoring.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_mailbox',
      description: 'Check for new incoming messages in an existing temporary mailbox session.',
      parameters: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'The CSRF token from the mailbox session' },
          cookies: { type: 'object', description: 'The serialized cookie jar from the session' }
        },
        required: ['token', 'cookies']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_music',
      description: 'Trigger a high-fidelity AI music composition job with custom styles.',
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
      name: 'check_music_status',
      description: 'Check the real-time generation percentage and final audio result for a music job.',
      parameters: {
        type: 'object',
        properties: {
          song_id: { type: 'string', description: 'The unique ID of the song being generated' }
        },
        required: ['song_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remove_background',
      description: 'Remove the background from an image using AI edge detection.',
      parameters: {
        type: 'object',
        properties: {
          image_url: { type: 'string', description: 'Direct URL to the source image' }
        },
        required: ['image_url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_media',
      description: 'Scrape Vidbox/TMDB archives for cinematic metadata and mirrors.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Movie title' }
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
  },
  {
    type: 'function',
    function: {
      name: 'search_manga',
      description: 'Searches for manga, manhwa, or manhua in the Komiku database.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Series title' }
        },
        required: ['query']
      }
    }
  }
];

function isToolLikelyNeeded(content: string): boolean {
  const c = content.toLowerCase();
  const triggers = [
    'email', 'mail', 'mailbox', 'temp', 'sementara', 'cek inbox', 'ada pesan',
    'musik', 'music', 'lagu', 'nyanyi', 'compose', 'remusic', 'status musik', 'sudah jadi',
    'film', 'movie', 'nonton', 'bioskop', 'movieku', 'vidbox', 'tayang',
    'anime', 'donghua', 'anichin', 'otakudesu', 'kartun jepang',
    'manga', 'manhwa', 'manhua', 'komik', 'komiku', 'baca',
    'hapus background', 'hilangkan latar', 'bg remover'
  ];
  return triggers.some(t => c.includes(t));
}

export async function nexAgentChat(messages: any[], modelId: string = "google/gemini-2.0-flash-exp:free") {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      role: "assistant",
      content: "System configuration missing: OpenRouter API key is not set."
    };
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": siteConfig.url,
      "X-Title": `${siteConfig.name} NexAgent`,
    }
  });

  const systemInstructions = `
You are NexAgent, the premium AI orchestrator for ${siteConfig.name}. Your goal is to deliver high-fidelity, visual responses using Markdown. 

VISUAL OUTPUT PROTOCOLS:
1. **Media Responses (Movies/Anime/Manga)**:
   - FORMAT AS A VISUAL CARD:
   - Always start with the title in an H3 header: ### [Judul]
   - Display poster URL prominently: ![Poster](url)
   - List details in this format:
     - **Tahun**: [Year]
     - **Rating**: ⭐ [Rating]
     - [▶️ Nonton/Baca Sekarang](URL)
   - Use a horizontal divider (---) to separate multiple results.

2. **Tone**: Premium, technical, and concise. Respond in Indonesian for media results and status reports.
`;

  const chatHistory: any[] = [];
  for (const m of messages) {
    if (m.role === 'user') {
      chatHistory.push({ role: "user", content: m.content });
    } else if (m.role === 'assistant') {
      const assistantMsg: any = { role: "assistant", content: m.content };
      if (m.toolCalls) assistantMsg.tool_calls = m.toolCalls;
      chatHistory.push(assistantMsg);
      if (m.toolResults) {
        for (const res of m.toolResults) {
          chatHistory.push({
            role: "tool",
            tool_call_id: res.id,
            name: res.name,
            content: JSON.stringify(res.result)
          });
        }
      }
    }
  }

  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
  const enableTools = isToolLikelyNeeded(lastUserMessage);

  try {
    const chatParams: any = {
      model: modelId,
      messages: [
        { role: "system", content: systemInstructions },
        ...chatHistory
      ],
    };

    if (enableTools) {
      chatParams.tools = tools;
      chatParams.tool_choice = "auto";
    }

    const response = await client.chat.completions.create(chatParams);
    const message = response.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolMessages: any[] = [];
      const toolResultsForPersistence: any[] = [];
      
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result: any;

        try {
          switch (functionName) {
            case 'generate_temp_mail':
              result = await initMailbox();
              break;
            case 'check_mailbox':
              result = await checkMessages(args.token, args.cookies);
              break;
            case 'generate_music':
              result = await createMusicJob({ prompt: args.prompt, title: args.title, mode: 'simple' });
              break;
            case 'check_music_status':
              result = await pollMusicStatus(args.song_id);
              break;
            case 'remove_background':
              result = await removeImageBackground({ url: args.image_url });
              break;
            case 'search_media':
              result = await vidboxSearch(args.query);
              break;
            case 'search_anime':
              result = await fetchAnichin({ mode: 'search', query: args.query });
              break;
            case 'search_manga':
              result = await fetchKomiku({ mode: 'search', query: args.query });
              break;
            default:
              result = { status: false, error: 'Tool not implemented.' };
          }
        } catch (e: any) {
          result = { status: false, error: e.message };
        }

        toolMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result),
        });
        toolResultsForPersistence.push({ id: toolCall.id, name: functionName, result });
      }

      const finalResponse = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: "system", content: systemInstructions },
          ...chatHistory,
          message,
          ...toolMessages
        ]
      });

      return {
        role: "assistant",
        content: finalResponse.choices[0].message.content || "Request processed.",
        usage: finalResponse.usage,
        toolCalls: message.tool_calls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        })),
        toolResults: toolResultsForPersistence
      };
    }

    return {
      role: "assistant",
      content: message.content || "I'm not sure how to respond to that.",
      usage: response.usage
    };

  } catch (error: any) {
    return {
      role: "assistant",
      content: `Nexus connection failure: ${error.message || 'Unknown error'}`
    };
  }
}
