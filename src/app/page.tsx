import Link from "next/link";
import Image from "next/image";
import CTABanner from "@/components/CTABanner";
import { getDictionary, getLocale } from "@/i18n";
import {
  fetchIndex,
  fetchBrief,
  imageUrl,
  formatThaiDateTime,
} from "@/lib/research";

// Match RESEARCH_REVALIDATE in lib/research.ts so the home teaser refreshes
// on the same cadence as the daily brief.
export const revalidate = 300;

const TEASER_COUNT = 3;

async function getEpisodeHeroImage(file: string): Promise<string | null> {
  const brief = await fetchBrief(file);
  if (brief?.frontmatter.image) {
    return imageUrl(brief.frontmatter.image);
  }
  return null;
}

export default async function Home() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const services = dict.services.items;
  const caseStudies = dict.caseStudies;
  const whyEnabridge = dict.whyEnabridge;
  const trainingCredentials = dict.trainingCredentials;

  // Pull the latest research episodes for the home teaser. Failures (network,
  // missing index) just collapse the section gracefully — the rest of the
  // page still renders.
  const researchIndex = await fetchIndex();
  const teaserEpisodes = (researchIndex?.episodes ?? []).slice(0, TEASER_COUNT);
  const teaserHeros = await Promise.all(
    teaserEpisodes.map((ep) =>
      ep.items[0]
        ? getEpisodeHeroImage(ep.items[0].file)
        : Promise.resolve(null),
    ),
  );

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-bg-primary">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-12 lg:py-40">
          <p className="eyebrow text-xs text-premium">
            {dict.home.hero.label}
          </p>
          <h1 className="display-serif mt-7 max-w-4xl text-4xl leading-[1.1] text-text-primary sm:text-5xl lg:text-[3.5rem]">
            {dict.home.hero.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-text-muted">
            {dict.home.hero.description}
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center rounded-lg bg-cta-bg px-8 py-3.5 text-sm font-semibold text-cta-fg shadow-md transition hover:bg-cta-hover"
            >
              {dict.home.hero.ctaPrimary}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-sm font-medium text-text-muted transition hover:border-primary hover:text-primary"
            >
              {dict.home.hero.ctaSecondary}
            </Link>
          </div>
          <div className="mt-16 flex flex-wrap gap-3">
            {dict.home.trustChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-bg-surface/80 px-4 py-2 text-xs font-medium tracking-wide text-text-secondary"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="border-b border-border bg-bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
          <p className="eyebrow text-xs text-premium">
            {dict.home.whatWeDo.label}
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {dict.home.whatWeDo.title}
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-xl border border-border bg-bg-primary p-8 transition hover:border-accent/40 hover:bg-bg-elevated"
              >
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {s.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proven delivery */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
          <p className="eyebrow text-xs text-premium">
            {dict.home.shipped.label}
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {dict.home.shipped.title}
          </h2>
          <p className="mt-4 max-w-2xl text-text-muted leading-relaxed">
            {dict.home.shipped.subtitle}
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/case-studies/${cs.slug}`}
                className="group rounded-xl border border-border bg-bg-surface p-8 transition hover:border-accent/40 hover:bg-bg-elevated"
              >
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition">
                  {cs.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {cs.tagline}
                </p>
                <p className="mt-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-accent">
                  {cs.aiStory}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {cs.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg bg-bg-primary px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-accent">
                        {stat.value}
                      </p>
                      <p className="text-xs text-text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Training track record */}
      <section className="border-b border-border bg-bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
          <p className="eyebrow text-xs text-premium">
            {dict.home.training.label}
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {dict.home.training.title}
          </h2>
          <p className="mt-4 max-w-2xl text-text-muted leading-relaxed">
            {dict.home.training.subtitle}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trainingCredentials.map((cred) => (
              <div
                key={cred.name}
                className="rounded-xl border border-border bg-bg-primary px-5 py-6"
              >
                <h3 className="text-sm font-semibold text-accent">
                  {cred.name}
                </h3>
                <p className="mt-1 text-xs text-text-muted">{cred.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OpenBridge teaser */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
          <p className="eyebrow text-xs text-premium">
            {dict.home.openbridgeTeaser.label}
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {dict.home.openbridgeTeaser.title}
          </h2>
          <p className="mt-6 max-w-2xl text-text-muted leading-relaxed">
            {dict.home.openbridgeTeaser.description}
          </p>
          <div className="mt-8">
            <Link
              href="/openbridge"
              className="inline-flex items-center justify-center rounded-lg border border-primary/40 bg-primary/5 px-7 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-cta-fg"
            >
              {dict.home.openbridgeTeaser.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Enabridge */}
      <section className="border-b border-border bg-bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
          <p className="eyebrow text-xs text-premium">
            {dict.home.whyEnabridge.label}
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {dict.home.whyEnabridge.title}
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {whyEnabridge.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-bg-primary p-8"
              >
                <h3 className="text-lg font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights — daily AI brief teaser */}
      {teaserEpisodes.length > 0 && (
        <section className="border-b border-border bg-bg-primary">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-xs text-premium">
                  {dict.home.insights.label}
                </p>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                  {dict.home.insights.title}
                </h2>
                <p className="mt-4 max-w-2xl text-text-muted leading-relaxed">
                  {dict.home.insights.description}
                </p>
              </div>
              <Link
                href="/research"
                className="hidden shrink-0 items-center gap-2 text-sm font-medium text-primary transition hover:text-accent sm:inline-flex"
              >
                {dict.home.insights.allLink}
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {teaserEpisodes.map((ep, i) => {
                const hero = teaserHeros[i];
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
                          <div className="flex h-full items-center justify-center text-5xl opacity-30">
                            🎧
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-elevated to-transparent" />
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-premium">
                          <span>{formatThaiDateTime(ep.iso_date)}</span>
                          <span className="text-border">·</span>
                          <span className="text-text-muted">
                            {ep.items.length} {dict.home.insights.cardLabel}
                          </span>
                        </div>
                        <h3 className="mt-3 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-text-primary group-hover:text-accent">
                          {firstStory}
                        </h3>
                        {extraCount > 0 && ep.items[1] && (
                          <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                            + {ep.items[1].title}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 sm:hidden">
              <Link
                href="/research"
                className="inline-flex items-center justify-center rounded-lg border border-primary/40 bg-primary/5 px-7 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-cta-fg"
              >
                {dict.home.insights.allLink} →
              </Link>
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
