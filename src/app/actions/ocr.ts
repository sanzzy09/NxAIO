'use server';

/**
 * Server action to handle OCR (Optical Character Recognition) requests.
 * Uses the imagetotext.my service to extract text from images and PDFs.
 */

const BASE = 'https://imagetotext.my';
const API = `${BASE}/index.php`;

async function fetchCookie() {
  try {
    const res = await fetch(BASE, { 
      method: 'GET', 
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
      },
      cache: 'no-store'
    });

    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) return null;

    // Standard parser for set-cookie header to find the 'login' session cookie
    const loginCookie = setCookie
      .split(/,(?=[^ ])/)
      .map(c => c.split(';')[0].trim())
      .find(c => c.startsWith('login='));

    return loginCookie || null;
  } catch (e) {
    return null;
  }
}

export async function extractText(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const cookie = await fetchCookie();
    if (!cookie) throw new Error('The OCR service is temporarily unavailable (session failed).');

    // 1. Upload the file
    const uploadForm = new FormData();
    uploadForm.append('op', 'upload_direct');
    uploadForm.append('file', file);

    const uploadRes = await fetch(API, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
        'Cookie': cookie,
        'Origin': BASE,
        'Referer': `${BASE}/`,
      },
      body: uploadForm
    });

    const uploadJson = await uploadRes.json();
    if (!uploadJson?.success) {
      throw new Error(uploadJson?.message || uploadJson?.error || 'File upload failed.');
    }

    const { key, file_id } = uploadJson.data;
    if (!key || !file_id) throw new Error('Invalid response from OCR server.');

    // 2. Poll for the result
    const start = Date.now();
    const timeout = 110000; // 110 seconds limit for server action
    let resultText = '';

    while (Date.now() - start < timeout) {
      const params = new URLSearchParams({
        op: 'status',
        action: 'check_task_status',
        file_id: String(file_id),
        filename: key,
      });

      const pollRes = await fetch(`${API}?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
          'Cookie': cookie,
        },
        cache: 'no-store'
      });

      const pollJson = await pollRes.json();
      const data = pollJson?.data || pollJson || {};
      const status = String(data.status || '').toLowerCase();

      if (['completed', 'complete', 'done', 'success'].includes(status)) {
        const r = data.result || data;
        resultText = r.ocr_text || r.text || '';
        break;
      }

      if (status.includes('fail') || status.includes('error')) {
        throw new Error(`OCR processing error: ${status}`);
      }

      // Wait 3 seconds before next poll
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!resultText) {
      throw new Error('OCR process timed out or returned no content.');
    }

    return {
      status: true,
      data: {
        text: resultText,
        fileName: file.name
      }
    };

  } catch (error: any) {
    console.error('OCR Action Error:', error.message);
    return {
      status: false,
      error: error.message || "An unexpected error occurred during text extraction."
    };
  }
}
