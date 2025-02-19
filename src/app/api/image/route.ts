import crypto from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { NextRequest } from "next/server";
import { join } from "path";
import sharp from "sharp";

const CACHE_DIR = join(process.cwd(), ".image-cache");

// Create cache directory if it doesn't exist
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR);
}

function getCacheKey(imageUrl: string, width: number, quality: number): string {
  return crypto
    .createHash("md5")
    .update(`${imageUrl}-${width}-${quality}`)
    .digest("hex");
}

async function getImageBuffer(imageUrl: string): Promise<Buffer> {
  let buffer: Buffer;

  // Handle remote images
  if (imageUrl.startsWith("http")) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    // Handle local images from public directory
    const imagePath = `public${imageUrl}`;
    buffer = await sharp(imagePath).toBuffer();
  }

  return buffer;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");
  const width = parseInt(searchParams.get("w") || "0");
  const quality = parseInt(searchParams.get("q") || "75");

  console.log(Array.from(request.headers.entries()));

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const cacheKey = getCacheKey(imageUrl, width, quality);
    const cachePath = join(CACHE_DIR, `${cacheKey}.webp`);

    // Generate ETag from cache key
    const etag = `"${cacheKey}"`;

    // Check if the client sent If-None-Match header
    const ifNoneMatch = request.headers.get("if-none-match");

    if (ifNoneMatch === etag && existsSync(cachePath)) {
      // Return 304 Not Modified if ETag matches
      return new Response(null, {
        status: 304,
        headers: {
          // "Cache-Control": "public, max-age=31536000",
          ETag: etag,
        },
      });
    }

    let optimizedImage: Buffer;
    let cacheHit = false;

    // Check if cached version exists
    if (existsSync(cachePath)) {
      console.log("HIT THE CACHE");
      optimizedImage = readFileSync(cachePath);
      cacheHit = true;
    } else {
      // If not in cache, process the image
      const imageBuffer = await getImageBuffer(imageUrl);
      optimizedImage = await sharp(imageBuffer)
        .resize({
          width: width || undefined,
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({
          quality,
          effort: 6,
        })
        .toBuffer();

      // Save to cache
      writeFileSync(cachePath, optimizedImage);
    }

    return new Response(optimizedImage, {
      headers: {
        "Content-Type": "image/webp",
        // "Cache-Control": "public, max-age=31536000",
        ETag: etag,
        "X-Cache": cacheHit ? "HIT" : "MISS",
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return new Response("Error processing image", { status: 500 });
  }
}
