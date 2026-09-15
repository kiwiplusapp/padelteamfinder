/**
 * Shared header for product pages. One H1, an optional lead, and a slot for
 * the page's primary action. No eyebrow: the route already says where you are.
 */
export function PageHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pb-8 pt-10 md:pt-14">
      <div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.92]">
          {title}
        </h1>
        {lead && (
          <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-paper/65">
            {lead}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
