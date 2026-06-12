'use server';

import axios from 'axios';
import FormData from 'form-data';

/**
 * Server action for AppMaker integration.
 * Converts website URLs to Android Applications (.apk/.aab)
 */

const CONFIG = {
  BASE_URL: "https://standalone-app-api.appmaker.xyz/webapp/build",
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'origin': 'https://create.appmaker.xyz',
    'referer': 'https://create.appmaker.xyz/',
  }
};

async function uploadFileToAppMaker(file: File, appId: string) {
  const form = new FormData();
  const buffer = Buffer.from(await file.arrayBuffer());
  
  form.append('file', buffer, {
    filename: file.name,
    contentType: file.type || 'image/jpeg',
  });
  form.append('id', appId);

  const res = await axios.post(`${CONFIG.BASE_URL}/file-upload`, form, {
    headers: {
      ...CONFIG.HEADERS,
      ...form.getHeaders(),
    },
  });

  return res.data;
}

export async function initiateAppBuild(input: {
  url: string;
  email: string;
  appName: string;
  icon: File;
  splash: File;
  toolbarColor?: string;
  toolbarTitleColor?: string;
  enableToolbar?: boolean;
}) {
  try {
    // 1. Create Initial App Record
    const createRes = await axios.post(CONFIG.BASE_URL, {
      url: input.url,
      email: input.email
    }, { headers: CONFIG.HEADERS });

    const appId = createRes.data?.body?.appId;
    if (!appId) throw new Error("Failed to provision App ID.");

    // 2. Upload Assets
    const iconRes = await uploadFileToAppMaker(input.icon, appId);
    const splashRes = await uploadFileToAppMaker(input.splash, appId);

    const iconUrl = iconRes?.cloudStoragePublicUrl;
    const splashUrl = splashRes?.cloudStoragePublicUrl;

    // 3. Start Build
    const buildConfig = {
      appId: appId,
      appIcon: iconUrl,
      appName: input.appName,
      isPaymentInProgress: false,
      enableShowToolBar: input.enableToolbar ?? true,
      toolbarColor: input.toolbarColor || "#03A9F4",
      toolbarTitleColor: input.toolbarTitleColor || "#FFFFFF",
      splashIcon: splashUrl,
    };

    await axios.post(`${CONFIG.BASE_URL}/build`, buildConfig, {
      headers: { ...CONFIG.HEADERS, 'Content-Type': 'application/json' }
    });

    return {
      status: true,
      data: { appId }
    };
  } catch (error: any) {
    console.error("AppMaker Init Error:", error.message);
    return { status: false, error: error.message };
  }
}

export async function checkBuildStatus(appId: string) {
  try {
    const res = await axios.get(`${CONFIG.BASE_URL}/status?appId=${appId}`, {
      headers: CONFIG.HEADERS
    });
    return { status: true, data: res.data?.body };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}

export async function getAppDownloadLinks(appId: string) {
  try {
    const res = await axios.get(`https://standalone-app-api.appmaker.xyz/webapp/complete/download?appId=${appId}`, {
      headers: CONFIG.HEADERS
    });
    return { status: true, data: res.data?.body };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}
