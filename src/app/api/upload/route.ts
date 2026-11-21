import { auth, ensureAuthConnection } from "@/lib/auth";
import { env } from "@/lib/env";
import { headers } from "next/headers";

/**
 * Uploads an image to ImgBB and returns the hosted URL.
 *
 * The API key lives only on the server. The client sends the raw file as
 * multipart/form-data (`image` field); this handler converts it to base64,
 * which is what ImgBB expects.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  // Only signed-in users may upload. Sign-up completes before this is called,
  // so the new account's session cookie is already present.
  await ensureAuthConnection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return fail("You must be signed in to upload an image.", 401);
  }

  const apiKey = env.IMGBB_API_KEY;
  if (!apiKey) {
    return fail(
      "Image hosting is not configured (IMGBB_API_KEY is missing).",
      503,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Expected a multipart/form-data body.", 400);
  }

  const image = form.get("image");
  if (!image || typeof image === "string") {
    return fail('Missing "image" file field.', 400);
  }
  if (!ALLOWED_TYPES.has(image.type)) {
    return fail("Unsupported image type. Use JPEG, PNG, WebP or GIF.", 415);
  }
  if (image.size > MAX_FILE_SIZE) {
    return fail("Image is too large (max 5 MB).", 413);
  }

  const upload = new FormData();
  upload.append(
    "image",
    Buffer.from(await image.arrayBuffer()).toString("base64"),
  );
  const filename = image.name.replace(/\.[^.]+$/, "").slice(0, 31);
  if (filename) upload.append("name", filename);

  let response: Response;
  try {
    response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: upload, cache: "no-store" },
    );
  } catch {
    return fail("Could not reach ImgBB. Please try again.", 502);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ImgbbResponse | null;

  if (!response.ok || !payload?.success || !payload.data?.url) {
    return fail(payload?.error?.message ?? "ImgBB rejected the upload.", 502);
  }

  return Response.json({
    url: payload.data.url,
    displayUrl: payload.data.display_url ?? payload.data.url,
    thumbUrl: payload.data.thumb?.url ?? payload.data.url,
    deleteUrl: payload.data.delete_url ?? null,
    id: payload.data.id ?? null,
    hosted: "imgbb",
  });
}

interface ImgbbResponse {
  success: boolean;
  data?: {
    id?: string;
    url?: string;
    display_url?: string;
    delete_url?: string;
    thumb?: { url?: string };
  };
  error?: { message?: string };
}
