import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

/**
 * Private podcast feed for Enabridge Daily AI Brief.
 *
 * Reads audio files + metadata from public/research/audio/:
 *   YY-MM-DD.mp3   — episode audio
 *   YY-MM-DD.json  — episode metadata (from scripts/tts.py)
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

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

type EpisodeMeta = {
  date: string;
  iso_date: string;
  title: string;
  items: { file: string; title: string; order: number }[];
  audio_file: string;
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

async function listEpisodes(): Promise<Array<EpisodeMeta & { size: number }>> {
  const audioDir = join(process.cwd(), "public", "research", "audio");
  let files: string[];
  try {
    files = await readdir(audioDir);
  } catch {
    return [];
  }

  const metaFiles = files.filter((f) => f.endsWith(".json"));
  const episodes: Array<EpisodeMeta & { size: number }> = [];
  for (const mf of metaFiles) {
    try {
      const raw = await readFile(join(audioDir, mf), "utf-8");
      const meta = JSON.parse(raw) as EpisodeMeta;
      const mp3Path = join(audioDir, meta.audio_file);
      const s = await stat(mp3Path).catch(() => null);
      if (!s) continue;
      episodes.push({ ...meta, size: s.size });
    } catch {
      // skip malformed meta
    }
  }
  // newest first
  episodes.sort((a, b) => b.iso_date.localeCompare(a.iso_date));
  return episodes;
}

export async function GET() {
  const episodes = await listEpisodes();
  const lastBuildDate = new Date().toUTCString();

  const itemsXml = episodes
    .map((ep) => {
      const audioUrl = `${BASE_URL}/research/audio/${ep.audio_file}`;
      const description =
        ep.items
          .map((i) => `${i.order}. ${i.title}`)
          .join(" · ") || ep.title;
      return `    <item>
      <title>${xmlEscape(ep.title)}</title>
      <description>${xmlEscape(description)}</description>
      <pubDate>${pubDate(ep.iso_date)}</pubDate>
      <guid isPermaLink="false">enabridge-research-${ep.date}</guid>
      <enclosure url="${audioUrl}" length="${ep.size}" type="audio/mpeg" />
      <itunes:duration>00:00:00</itunes:duration>
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
