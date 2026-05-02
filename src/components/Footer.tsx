import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { contactInfo } from "@/data/content";
import { getDictionary, getLocale } from "@/i18n";

export default async function Footer() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-border bg-bg-primary/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              {dict.brand.footerTagline}
            </p>
          </div>
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.15em] text-text-secondary uppercase">
              {dict.footer.sectionServices}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/services/custom-development"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.nav.children.customDevelopment}
              </Link>
              <Link
                href="/services/ai-training"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.nav.children.aiTraining}
              </Link>
              <Link
                href="/services/ai-consulting"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.nav.children.aiConsulting}
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.15em] text-text-secondary uppercase">
              {dict.footer.sectionCompany}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/case-studies"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.nav.caseStudies}
              </Link>
              <Link
                href="/how-we-work"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.nav.howWeWork}
              </Link>
              <Link
                href="/openbridge"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.nav.openbridge}
              </Link>
              <Link
                href="/company"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.footer.aboutLink}
              </Link>
              <Link
                href="/research"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.footer.insightsLink}
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.15em] text-text-secondary uppercase">
              {dict.footer.sectionContact}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={contactInfo.line.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                LINE {contactInfo.line.id}
              </a>
              <a
                href={contactInfo.phone.href}
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {contactInfo.phone.display}
              </a>
              <a
                href={contactInfo.email.href}
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {contactInfo.email.display}
              </a>
              <a
                href={contactInfo.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-muted transition hover:text-accent"
              >
                {dict.footer.youtubePrefix} {contactInfo.youtube.handle}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Enabridge.{" "}
            {dict.footer.rightsReserved}
          </p>
          <p className="text-xs text-text-muted/70">{dict.footer.location}</p>
        </div>
      </div>
    </footer>
  );
}
