/**
 * Shared helpers for the /research section.
 *
 * Pulls data from the enabridge-research repo via raw.githubusercontent.com.
 * Everything is server-side + ISR-cached, so fetches are cheap and rare.
 */
import matter from "gray-matter";

const GH_OWNER = process.env.GITHUB_OWNER ?? "Enabridge";
const GH_REPO = process.env.GITHUB_REPO ?? "EnabridgeResearch";
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
export const RAW_BASE = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}`;

// 5-minute ISR — matches podcast feed revalidation
export const RESEARCH_REVALIDATE = 300;

export type BriefItem = {
  file: string;
  title: string;
  order: number;
};

export type Episode = {
  date: string; // YY-MM-DD
  iso_date: string;
  title: string;
  description?: string;
  items: BriefItem[];
  audio_file: string;
  audio_size_bytes: number;
  voice?: string;
  model?: string;
  speed?: number;
  script_char_count?: number;
};

export type Index = {
  generated_at: string;
  count: number;
  episodes: Episode[];
};

export type Brief = {
  frontmatter: {
    date?: string;
    slug?: string;
    topic?: string;
    reading_time_min?: number | string;
    sources?: number | string;
    image_prompt?: string;
    image?: string;
  };
  title: string;
  body: string;
};

export async function fetchIndex(): Promise<Index | null> {
  try {
    const res = await fetch(`${RAW_BASE}/audio/index.json`, {
      next: { revalidate: RESEARCH_REVALIDATE },
    });
    if (!res.ok) {
      console.error(`[research] index.json fetch failed: HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as Index;
  } catch (e) {
    console.error("[research] index fetch error:", e);
    return null;
  }
}

export async function fetchBrief(filename: string): Promise<Brief | null> {
  try {
    const res = await fetch(`${RAW_BASE}/news/${filename}`, {
      next: { revalidate: RESEARCH_REVALIDATE },
    });
    if (!res.ok) return null;
    const raw = await res.text();
    const parsed = matter(raw);
    // Extract H1 as title
    const titleMatch = parsed.content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : parsed.data.slug ?? filename;
    // Strip the H1 from body so we render it separately
    const body = parsed.content.replace(/^#\s+.+$/m, "").trim();
    // Also strip the "## Audio script" section — that's for TTS, not for display
    const displayBody = body.replace(
      /\n##\s*Audio script[\s\S]*$/m,
      "",
    ).trim();
    return {
      frontmatter: parsed.data,
      title,
      body: displayBody,
    };
  } catch (e) {
    console.error(`[research] fetchBrief(${filename}) error:`, e);
    return null;
  }
}

export async function fetchEpisodeBriefs(episode: Episode): Promise<Brief[]> {
  const results = await Promise.all(
    episode.items.map((item) => fetchBrief(item.file)),
  );
  return results.filter((b): b is Brief => b !== null);
}

export function audioUrl(audio_file: string): string {
  return `${RAW_BASE}/audio/${audio_file}`;
}

export function imageUrl(imagePath: string): string {
  // imagePath is like "images/26-04-19-001-slug.png" (relative to news/)
  return `${RAW_BASE}/news/${imagePath.replace(/^\/+/, "")}`;
}

export function formatThaiDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
