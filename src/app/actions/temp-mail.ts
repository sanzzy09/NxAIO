
'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const BASE_URL = 'https://tempail.top';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Initializes a new temporary email session.
 * Returns the address, CSRF token, and serialized cookie jar.
 */
export async function initMailbox() {
  try {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));
    
    // 1. Get Home Page for CSRF
    const home = await client.get(BASE_URL, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    const $ = cheerio.load(home.data);
    const token = $('meta[name="csrf-token"]').attr('content') || $('input[name="_token"]').val();
    
    if (!token) throw new Error('CSRF token not found');

    // 2. Get Mailbox Address
    const res = await client.post(
      `${BASE_URL}/messages?${Date.now()}`,
      `_token=${token}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*'
        }
      }
    );

    if (!res.data || !res.data.mailbox) {
      throw new Error('Failed to obtain mailbox address');
    }

    return {
      status: true,
      data: {
        mailbox: res.data.mailbox,
        token: token,
        cookies: await jar.serialize()
      }
    };
  } catch (error: any) {
    console.error('TempMail Init Error:', error.message);
    return { status: false, error: error.message };
  }
}

/**
 * Checks for messages in an existing mailbox session.
 */
export async function checkMessages(token: string, serializedJar: any) {
  try {
    const jar = await CookieJar.deserialize(serializedJar);
    const client = wrapper(axios.create({ jar, withCredentials: true }));

    const res = await client.post(
      `${BASE_URL}/messages?${Date.now()}`,
      `_token=${token}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*'
        }
      }
    );

    const data = res.data;
    const messages = (data.messages || []).map((msg: any) => {
      // Clean HTML from content to create a preview/plain version
      const plain = (msg.content || msg.body || '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract potential codes
      const codeMatch = plain.match(/\b(\d{4,8})\b/);

      return {
        id: msg.id || `${msg.from}-${msg.subject}-${msg.time}`,
        from: msg.from,
        subject: msg.subject,
        time: msg.date || msg.time || '-',
        content: msg.content || msg.body || '',
        preview: plain.substring(0, 200),
        code: codeMatch ? codeMatch[1] : null
      };
    });

    return {
      status: true,
      data: {
        messages,
        cookies: await jar.serialize()
      }
    };
  } catch (error: any) {
    console.error('TempMail Poll Error:', error.message);
    return { status: false, error: error.message };
  }
}
