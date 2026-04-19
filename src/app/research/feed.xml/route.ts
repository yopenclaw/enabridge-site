import { NextResponse } from "next/server";

/**
 * Private podcast feed for Enabridge Daily AI Brief.
 *
 * Reads episode metadata from the enabridge-research repo on GitHub via the
 * raw.githubusercontent.com CDN. The research repo's cron updates
 * audio/index.json + audio/YY-MM-DD.mp3 every morning; this route just
 * reflects that into an RSS feed.
 *
 * Set GITHUB_OWNER / GITHUB_REPO / GITHUB_BRANCH in the enabridge-site
 * environment (defaults below assume repo name `enabridge-research`, branch `main`).
 *
 * Subscribe in Apple Podcasts / Spotify / Overcast:
 *   https://enabridge.ai/research/feed.xml
 */

const BASE_URL = "https://enabridge.ai";
const FEED_TITLE = "Enabridge Daily AI Brief";
const FEED_DESCRIPTION =
  "สรุปข่าว Agentic AI, business use case, และ trend ที่เอาไปใช้กับ OpenBridge ได้ — ส่งทุกเช้า ≤5 นาที";
const AUTHOR = "Yoh / Enabridge";
const FEED_LANGUAGE = "th-TH";
const FEED_CATEGORY = "Technology";

const GH_OWNER = process.env.GITHUB_OWNER ?? "enabridge";
const GH_REPO = process.env.GITHUB_REPO ?? "enabridge-research";
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const RAW_BASE = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}`;

// Cache the feed for 5 min (ISR). Podcast clients typically poll every 30-60 min,
// so this stays well under GitHub's raw.githubusercontent abuse limits.
export const revalidate = 300;

type EpisodeMeta = {
  date: string;
  iso_date: string;
  title: string;
  description?: string;
  items: { file: string; title: string; order: number }[];
  audio_file: string;
  audio_size_bytes: number;
};

type Index = {
  generated_at: string;
  count: number;
  episodes: EpisodeMeta[];
};

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pubDate(iso: string): string {
  return new Date(iso).toUTCString();
}

async function fetchIndex(): Promise<Index | null> {
  try {
    const res = await fetch(`${RAW_BASE}/audio/index.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[feed] index.json fetch failed: HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as Index;
  } catch (e) {
    console.error("[feed] index.json fetch error:", e);
    return null;
  }
}

export async function GET() {
  const index = await fetchIndex();
  const episodes = index?.episodes ?? [];
  const lastBuildDate = new Date().toUTCString();

  const itemsXml = episodes
    .map((ep) => {
      const audioUrl = `${RAW_BASE}/audio/${ep.audio_file}`;
      const description =
        ep.description ||
        ep.items.map((i) => `${i.order}. ${i.title}`).join(" · ") ||
        ep.title;
      return `    <item>
      <title>${xmlEscape(ep.title)}</title>
      <description>${xmlEscape(description)}</description>
      <pubDate>${pubDate(ep.iso_date)}</pubDate>
      <guid isPermaLink="false">enabridge-research-${ep.date}</guid>
      <enclosure url="${audioUrl}" length="${ep.audio_size_bytes}" type="audio/mpeg" />
      <itunes:explicit>no</itunes:explicit>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xmlEscape(FEED_TITLE)}</title>
    <link>${BASE_URL}/research</link>
    <atom:link href="${BASE_URL}/research/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <itunes:author>${xmlEscape(AUTHOR)}</itunes:author>
    <itunes:owner>
      <itunes:name>${xmlEscape(AUTHOR)}</itunes:name>
      <itunes:email>ekkachai.nua@gmail.com</itunes:email>
    </itunes:owner>
    <itunes:category text="${FEED_CATEGORY}" />
    <itunes:explicit>no</itunes:explicit>
    <itunes:image href="${BASE_URL}/research/cover.png" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
