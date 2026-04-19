import Link from "next/link";
import Image from "next/image";
import {
  RESEARCH_REVALIDATE,
  fetchIndex,
  fetchBrief,
  imageUrl,
  formatThaiDate,
} from "@/lib/research";

export const revalidate = RESEARCH_REVALIDATE;

export const metadata = {
  title: "Daily AI Brief",
  description:
    "สรุปข่าว Agentic AI, real-world AI use cases, และ OpenBridge-relevant trends ทุกเช้า ≤5 นาที",
};

const FEED_URL = "https://enabridge.ai/research/feed.xml";
const MAX_EPISODES = 60;

/**
 * Peek the first brief of each episode to grab its hero image.
 * Falls back gracefully when image isn't ready yet (GHA not done).
 */
async function getEpisodeHeroImage(
  file: string,
): Promise<string | null> {
  const brief = await fetchBrief(file);
  if (brief?.frontmatter.image) {
    return imageUrl(brief.frontmatter.image);
  }
  return null;
}

export default async function ResearchIndexPage() {
  const index = await fetchIndex();
  const episodes = (index?.episodes ?? []).slice(0, MAX_EPISODES);

  // Prefetch hero images in parallel (all server-side, cached)
  const heros = await Promise.all(
    episodes.map((ep) =>
      ep.items[0]
        ? getEpisodeHeroImage(ep.items[0].file)
        : Promise.resolve(null),
    ),
  );

  return (
    <main className="bg-bg-primary">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <p className="text-xs font-medium tracking-[0.25em] text-premium uppercase">
            Enabridge Research
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem]">
            Daily AI Brief
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
            สรุปข่าว Agentic AI · real-world use case · OpenBridge-relevant
            trends — ทุกเช้าก่อนเริ่มงาน อ่านหรือฟังได้ใน 5 นาที
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`podcast://${FEED_URL.replace(/^https:\/\//, "")}`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-accent shadow-lg shadow-primary/20 transition hover:bg-cta-hover hover:shadow-cta-hover/25"
            >
              🎧 Subscribe in Podcast app
            </a>
            <a
              href="/research/feed.xml"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-text-muted transition hover:border-accent/50 hover:text-accent"
            >
              RSS feed
            </a>
          </div>
          <p className="mt-5 text-xs text-text-muted">
            Or paste this URL in any podcast app:{" "}
            <code className="rounded border border-border-subtle bg-bg-surface px-2 py-1 text-[0.75rem] text-text-secondary">
              {FEED_URL}
            </code>
          </p>
        </div>
      </section>

      {/* Episode grid */}
      <section className="bg-bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary sm:text-3xl">
                Latest briefs
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                {episodes.length > 0
                  ? `${episodes.length} วันล่าสุด · อัพเดททุกเช้า 07:00`
                  : "ยังไม่มี episode"}
              </p>
            </div>
          </div>

          {episodes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bg-elevated px-6 py-16 text-center text-text-muted">
              No episodes yet.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {episodes.map((ep, i) => {
                const hero = heros[i];
                const firstStory = ep.items[0]?.title ?? "";
                const extraCount = Math.max(ep.items.length - 1, 0);
                return (
                  <li key={ep.date}>
                    <Link
                      href={`/research/${ep.date}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-primary/10"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-primary">
                        {hero ? (
                          <Image
                            src={hero}
                            alt={firstStory}
                            fill
                            sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-6xl opacity-30">
                            🎧
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-elevated to-transparent" />
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-premium">
                          <span>{formatThaiDate(ep.iso_date)}</span>
                          <span className="text-border">·</span>
                          <span className="text-text-muted">
                            {ep.items.length} stories
                          </span>
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-text-primary group-hover:text-accent">
                          {firstStory}
                        </h3>

                        {extraCount > 0 && (
                          <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                            + {extraCount} เรื่องอื่น
                            {ep.items[1] ? `: ${ep.items[1].title}` : ""}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between pt-5 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-logo-mark" />
                            Read &amp; listen
                          </span>
                          <span className="opacity-0 transition group-hover:opacity-100">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
