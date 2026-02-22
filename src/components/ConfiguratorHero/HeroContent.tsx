import { CircleCheck } from "lucide-react";

interface HeroContentProps {
  productName: string;
  title: string;
  description: string;
  series?: string;
  badges?: string[];
}

export function HeroContent({
  productName,
  description,
  series,
  badges,
}: HeroContentProps) {
  const hasBadges = series || (badges && badges.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {hasBadges && (
        <div className="flex flex-wrap items-center gap-3">
          {series && (
            <span className="inline-flex items-center rounded-sm border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {series}
            </span>
          )}
          {series && badges && badges.length > 0 && (
            <div className="h-4 w-px bg-slate-200" />
          )}
          {badges?.map((badge, index) => (
            <span
              key={index}
              className={`flex items-center gap-1 text-xs font-medium ${
                index === 0 ? "text-brand-600" : "text-slate-500"
              }`}
            >
              <CircleCheck className="h-3 w-3" />
              {badge}
            </span>
          ))}
        </div>
      )}

      {!hasBadges && (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-sm border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {productName}
          </span>
        </div>
      )}

      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
        {productName}
      </h1>

      <article
        className="max-w-2xl text-base leading-relaxed text-slate-500"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}