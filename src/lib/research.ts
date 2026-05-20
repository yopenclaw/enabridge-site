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

// Manual frontmatter extraction for briefs whose YAML doesn't parse cleanly.
// Pulls out only the simple single-line fields we render (image, slug, topic,
// reading_time_min, sources) by matching `key: value` at the start of a line.
// Multi-line / quoted values are intentionally not handled — those go through
// the YAML path. The body strips the entire `---...---` block so it doesn't
// leak into the rendered markdown as a Setext heading.
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;
const SIMPLE_FIELDS = ["date", "slug", "topic", "reading_time_min", "sources", "image"] as const;

function manualParseBrief(raw: string): { data: Brief["frontmatter"]; content: string } {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return { data: {}, content: raw };
  const fmBlock = m[1];
  const data: Record<string, string> = {};
  for (const field of SIMPLE_FIELDS) {
    const line = fmBlock.match(new RegExp(`^${field}:[ \\t]*(.+)$`, "m"));
    if (line) data[field] = line[1].trim();
  }
  return { data, content: raw.slice(m[0].length) };
}

export async function fetchBrief(filename: string): Promise<Brief | null> {
  try {
    const res = await fetch(`${RAW_BASE}/news/${filename}`, {
      next: { revalidate: RESEARCH_REVALIDATE },
    });
    if (!res.ok) return null;
    const raw = await res.text();

    // gray-matter throws on malformed YAML (common when an LLM-generated
    // image_prompt contains `word: "value"` patterns). It also has a caching
    // quirk where the second call returns an empty `data` object with the
    // raw frontmatter still embedded in `content` — that's the case where
    // the YAML block was rendering as a Setext H2 in the body. Fall back to
    // manual extraction for both.
    let data: Brief["frontmatter"];
    let content: string;
    try {
      const parsed = matter(raw);
      const looksFailed =
        Object.keys(parsed.data ?? {}).length === 0 &&
        parsed.content.startsWith("---");
      if (looksFailed) {
        const manual = manualParseBrief(raw);
        data = manual.data;
        content = manual.content;
      } else {
        data = parsed.data;
        content = parsed.content;
      }
    } catch (yamlErr) {
      console.warn(
        `[research] ${filename}: YAML parse failed, using manual fallback:`,
        (yamlErr as Error).message,
      );
      const manual = manualParseBrief(raw);
      data = manual.data;
      content = manual.content;
    }

    // Extract H1 as title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : data.slug ?? filename;
    // Strip the H1 from body so we render it separately
    const body = content.replace(/^#\s+.+$/m, "").trim();
    // Also strip the "## Audio script" section — that's for TTS, not for display
    const displayBody = body.replace(
      /\n##\s*Audio script[\s\S]*$/m,
      "",
    ).trim();
    return {
      frontmatter: data,
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

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/**
 * Parse ISO manually (avoids TZ shift across Node/browser).
 * Handles both "2026-04-19" and "2026-04-19T07:00:00+07:00".
 */
function parseIsoParts(
  iso: string,
): { y: number; mo: number; d: number; h: number; mi: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return null;
  return {
    y: parseInt(m[1], 10),
    mo: parseInt(m[2], 10),
    d: parseInt(m[3], 10),
    h: m[4] ? parseInt(m[4], 10) : 0,
    mi: m[5] ? parseInt(m[5], 10) : 0,
  };
}

export function formatThaiDate(iso: string): string {
  const p = parseIsoParts(iso);
  if (!p) return iso;
  return `${p.d} ${THAI_MONTHS[p.mo - 1]} ${p.y + 543}`;
}

export function formatThaiDateTime(iso: string): string {
  const p = parseIsoParts(iso);
  if (!p) return iso;
  const hh = String(p.h).padStart(2, "0");
  const mi = String(p.mi).padStart(2, "0");
  return `${p.d} ${THAI_MONTHS[p.mo - 1]} ${p.y + 543} · ${hh}:${mi}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
