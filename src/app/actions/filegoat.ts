
'use server';

import axios from 'axios';
import FormData from 'form-data';
import { randomUUID } from 'crypto';

const BASE = "https://filego.at";
const S3_BASE = "https://filegoat.s3.de.io.cloud.ovh.net";

const HEADERS = {
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  referer: `${BASE}/`,
  origin: BASE,
};

async function uploadSingleFile(file: File) {
  const form = new FormData();
  const buffer = Buffer.from(await file.arrayBuffer());
  
  form.append("file", buffer, {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
  });

  const res = await axios.post(`${BASE}/api/file/upload`, form, {
    headers: {
      ...HEADERS,
      ...form.getHeaders(),
      accept: "application/json, text/plain, */*",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return res.data;
}

export async function uploadToHosting(formData: FormData, options: { days: number; extendOnView: boolean }) {
  try {
    const files = formData.getAll('files') as File[];
    if (!files.length) throw new Error('No files provided');

    const fileIds: string[] = [];
    for (const file of files) {
      const res = await uploadSingleFile(file);
      const ids = res.fileIds ?? res.ids ?? [res.id];
      fileIds.push(...ids);
    }

    const { days = 7, extendOnView = false } = options;

    const bucketRes = await axios.post(
      `${BASE}/api/bucket`,
      { fileIds, deleteTime: days, extendOnView, clientId: randomUUID() },
      {
        headers: {
          ...HEADERS,
          "content-type": "application/json",
          accept: "*/*",
        },
      }
    );

    const bucket = bucketRes.data;
    
    // Fetch detail to get direct links
    const detailRes = await axios.get(`${BASE}/api/bucket/${bucket.slug}`, {
      headers: { ...HEADERS, accept: "application/json" },
    });
    
    const detail = detailRes.data;
    const fileList = (detail.files || []).map((f: any) => {
      const name = f.fileName ?? f.file_name;
      const saved = f.savedName ?? f.saved_name;
      return {
        name,
        size: f.bytes,
        direct: `${S3_BASE}/${saved}/${name}`,
        download: `${S3_BASE}/${saved}/${name}?download=true`,
      };
    });

    return {
      status: true,
      data: {
        slug: bucket.slug,
        url: `${BASE}/bucket/${bucket.slug}`,
        expires: bucket.delete_time,
        files: fileList,
      }
    };
  } catch (error: any) {
    console.error('FileGoat Action Error:', error.message);
    return {
      status: false,
      error: error.response?.data?.message || error.message || "The hosting service is currently unreachable."
    };
  }
}

export async function getBucket(slug: string) {
  try {
    const res = await axios.get(`${BASE}/api/bucket/${slug}`, {
      headers: { ...HEADERS, accept: "application/json" },
    });
    
    const data = res.data;
    const fileList = (data.files || []).map((f: any) => {
      const name = f.fileName ?? f.file_name;
      const saved = f.savedName ?? f.saved_name;
      return {
        name,
        size: f.bytes,
        downloads: f.downloads,
        createdAt: f.createdAt ?? f.created_at,
        direct: `${S3_BASE}/${saved}/${name}`,
        download: `${S3_BASE}/${saved}/${name}?download=true`,
      };
    });

    return {
      status: true,
      data: {
        slug: data.slug,
        url: `${BASE}/bucket/${data.slug}`,
        expires: data.delete_time,
        extendOnView: data.extend_on_view,
        views: data.views,
        files: fileList,
      }
    };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}
