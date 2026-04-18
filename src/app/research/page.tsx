import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Landing page for the private podcast feed at /research.
 * Shows a simple subscribe link and episode list.
 */

type EpisodeMeta = {
  date: string;
  iso_date: string;
  title: string;
  items: { file: string; title: string; order: number }[];
  audio_file: string;
};

async function listEpisodes(): Promise<EpisodeMeta[]> {
  const audioDir = join(process.cwd(), "public", "research", "audio");
  let files: string[];
  try {
    files = await readdir(audioDir);
  } catch {
    return [];
  }
  const episodes: EpisodeMeta[] = [];
  for (const mf of files.filter((f) => f.endsWith(".json"))) {
    try {
      const raw = await readFile(join(audioDir, mf), "utf-8");
      episodes.push(JSON.parse(raw));
    } catch {}
  }
  episodes.sort((a, b) => b.iso_date.localeCompare(a.iso_date));
  return episodes;
}

export const metadata = {
  title: "Enabridge Daily AI Brief",
  description:
    "Daily brief on Agentic AI, real-world AI use cases, and OpenBridge-relevant trends.",
};

export default async function ResearchPage() {
  const episodes = await listEpisodes();
  const feedUrl = "https://enabridge.ai/research/feed.xml";

  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Enabridge Daily AI Brief</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Agentic AI · business use case · OpenBridge trends — daily, under 5 minutes.
      </p>

      <div style={{ margin: "2rem 0", padding: "1rem 1.25rem", background: "#f5f5f7", borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Subscribe</div>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li>
            Apple Podcasts / Spotify / Overcast: <a href={`podcast://${feedUrl.replace(/^https:\/\//, "")}`}>one-click subscribe</a>
          </li>
          <li>
            Or paste this URL manually: <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}>{feedUrl}</code>
          </li>
        </ul>
      </div>

      <h2 style={{ fontSize: "1.25rem", marginTop: "2rem" }}>Latest episodes</h2>
      {episodes.length === 0 ? (
        <p style={{ color: "#888" }}>No episodes yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {episodes.map((ep) => (
            <li key={ep.date} style={{ padding: "1rem 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600 }}>{ep.title}</div>
              <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.25rem" }}>
                {ep.items.map((i) => `${i.order}. ${i.title}`).join(" · ")}
              </div>
              <audio controls src={`/research/audio/${ep.audio_file}`} style={{ marginTop: "0.5rem", width: "100%" }} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
