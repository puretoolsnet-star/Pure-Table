import type { NextRequest } from "next/server";

const SEARCH_CRAWLER_UA =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|petalbot|bytespider|facebookexternalhit|twitterbot|linkedinbot|discordbot|slackbot|whatsapp|telegrambot|semrushbot|ahrefsbot|mj12bot|dotbot|rogerbot/i;

const SCRIPT_UA =
  /curl\/|wget\/|python-requests|aiohttp|scrapy|httpclient|java\/|go-http-client|libwww|perl|ruby|php\/|postmanruntime|insomnia/i;

type RateBucket = { count: number; resetAt: number };

const rateByKey = new Map<string, RateBucket>();
const MAX_TRACKED_KEYS = 4096;

const WINDOW_MS = 60_000;
const NORMAL_LIMIT = 120;
const SCRIPT_LIMIT = 24;
const BARE_UA_LIMIT = 18;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function pruneStaleBuckets(now: number) {
  if (rateByKey.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of rateByKey) {
    if (bucket.resetAt <= now) rateByKey.delete(key);
  }
  if (rateByKey.size >= MAX_TRACKED_KEYS) {
    const drop = Math.ceil(rateByKey.size * 0.25);
    let removed = 0;
    for (const key of rateByKey.keys()) {
      rateByKey.delete(key);
      removed += 1;
      if (removed >= drop) break;
    }
  }
}

function track(key: string, limit: number, now: number): boolean {
  pruneStaleBuckets(now);
  let bucket = rateByKey.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    rateByKey.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Lightweight edge rate limit; search crawlers are always allowed. */
export function shouldAllowRequest(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  if (SEARCH_CRAWLER_UA.test(ua)) return true;

  const ip = clientIp(request);
  const now = Date.now();
  const trimmedUa = ua.trim();

  if (!trimmedUa) {
    return track(`bare:${ip}`, BARE_UA_LIMIT, now);
  }

  if (SCRIPT_UA.test(ua)) {
    return track(`script:${ip}`, SCRIPT_LIMIT, now);
  }

  return track(`visit:${ip}`, NORMAL_LIMIT, now);
}