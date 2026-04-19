import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  RESEARCH_REVALIDATE,
  audioUrl,
  fetchEpisodeBriefs,
  fetchIndex,
  formatThaiDate,
  imageUrl,
} from "@/lib/research";

export const revalidate = RESEARCH_REVALIDATE;

type PageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { date } = await params;
  const index = await fetchIndex();
  const ep = index?.episodes.find((e) => e.date === date);
  if (!ep) {
    return { title: `Daily Brief — ${date}` };
  }
  return {
    title: ep.title,
    description: ep.description ?? ep.title,
  };
}

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 text-lg font-semibold uppercase tracking-[0.18em] text-premium">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-base font-semibold text-text-primary">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-[1.02rem] leading-[1.85] text-text-secondary">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 space-y-2 pl-5 text-[1.02rem] leading-[1.85] text-text-secondary [&>li]:list-disc [&>li]:marker:text-premium">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 space-y-2 pl-5 text-[1.02rem] leading-[1.85] text-text-secondary [&>li]:list-decimal">
      {children}
    </ol>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-text-secondary">{children}</em>
  ),
  hr: () => <hr className="my-10 border-border-subtle" />,
  code: ({ children }) => (
    <code className="rounded border border-border-subtle bg-bg-surface px-1.5 py-0.5 text-[0.9em] text-text-primary">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 border-premium bg-bg-surface/50 px-5 py-2 italic text-text-muted">
      {children}
    </blockquote>
  ),
};

export default async function ResearchDetailPage({ params }: PageProps) {
  const { date } = await params;
  const index = await fetchIndex();
  if (!index) notFound();
  const ep = index.episodes.find((e) => e.date === date);
  if (!ep) notFound();

  const briefs = await fetchEpisodeBriefs(ep);

  return (
    <main className="bg-bg-primary">
      {/* Header / audio player */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-14 lg:py-20">
          <Link
            href="/research"
            className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted transition hover:text-accent"
          >
            ← All briefs
          </Link>

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-premium">
            {formatThaiDate(ep.iso_date)} · {ep.items.length} stories
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.2] tracking-tight text-text-primary sm:text-4xl">
            {ep.title}
          </h1>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-bg-elevated p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
              🎧 Listen to today&apos;s brief
            </p>
            <audio
              controls
              preload="none"
              src={audioUrl(ep.audio_file)}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Stories */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-14 lg:py-20">
          {briefs.length === 0 ? (
            <p className="text-text-muted">Brief content ยังไม่พร้อม — ลองกลับมาใหม่อีกหน่อย</p>
          ) : (
            <div className="space-y-20">
              {briefs.map((brief, i) => (
                <article key={brief.frontmatter.slug ?? i} className="scroll-mt-20" id={`story-${i + 1}`}>
                  {brief.frontmatter.image && (
                    <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-bg-surface">
                      <Image
                        src={imageUrl(brief.frontmatter.image)}
                        alt={brief.title}
                        fill
                        sizes="(max-width:768px) 100vw, 768px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/15 px-2 font-semibold text-accent">
                      {i + 1}
                    </span>
                    {brief.frontmatter.topic && (
                      <span className="rounded-full border border-border-subtle bg-bg-surface px-3 py-0.5 uppercase tracking-[0.18em] text-text-muted">
                        {brief.frontmatter.topic}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.25] tracking-tight text-text-primary sm:text-[2rem]">
                    {brief.title}
                  </h2>

                  <div className="mt-2 max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {brief.body}
                    </ReactMarkdown>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-20 border-t border-border-subtle pt-10 text-center">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-accent"
            >
              ← กลับไปหน้ารวม briefs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
