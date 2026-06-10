'use server';

/**
 * Server action to handle image upscaling requests.
 * Bypasses CORS restrictions by performing the request server-side.
 */
function rid() {
  return `browser_${Date.now()}_${Math.random().toString(36).slice(2, 13)}`;
}

export async function upscaleImage(imageUrl: string, resolution: string = "16K") {
  const API = "https://api.ezremove.ai/api/ez-remove/ai-enhance/create-job-v2";

  try {
    const form = new FormData();
    form.append("original_image_url", imageUrl);
    form.append("model", "upscale_fast");
    form.append("params", JSON.stringify({ target_resolution: resolution }));

    const res = await fetch(API, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "product-serial": rid(),
        origin: "https://ezremove.ai",
        referer: "https://ezremove.ai/",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
      },
      body: form,
    });

    const json = await res.json();

    if (json?.code !== 100000) {
      return {
        status: false,
        error: json?.message || json?.msg || "Failed to upscale image.",
      };
    }

    return {
      status: true,
      data: {
        jobId: json?.result?.job_id,
        imageUrl: json?.result?.image_url,
      }
    };
  } catch (error: any) {
    console.error('Upscale Server Action Error:', error.message);
    return {
      status: false,
      error: error.message || "The upscaler service is currently unreachable."
    };
  }
}
