import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { getDictionary, getLocale } from "@/i18n";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
};

export default async function BrandLogo({
  href = "/",
  compact = false,
}: BrandLogoProps) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const content = (
    <>
      <BrandMark className={compact ? "h-10 w-auto" : "h-8 w-auto"} />
      <div className="min-w-0">
        <div className="text-sm font-semibold tracking-[0.24em] text-logo-text uppercase">
          Enabridge
        </div>
        {!compact && (
          <div className="text-[11px] tracking-[0.18em] text-text-secondary uppercase">
            {dict.brand.tagline}
          </div>
        )}
      </div>
    </>
  );

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 text-logo-mark transition hover:opacity-90"
    >
      {content}
    </Link>
  );
}
