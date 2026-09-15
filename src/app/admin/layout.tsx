import Link from "next/link";

/**
 * Club console shell.
 *
 * Denser than the public site on purpose: this is an operational surface, so
 * it trades the marketing rhythm for rows, counts and fast scanning. It keeps
 * the same tokens, so it still reads as the same product.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header
        className="sticky top-0 border-b border-[var(--line)] bg-cobalt-950/90 backdrop-blur-md"
        style={{ zIndex: "var(--z-nav)" }}
      >
        <div className="shell flex h-[60px] items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-lg leading-none">
              Padel<span className="text-volt">Party</span>
            </Link>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/45">
              Panel de club
            </span>
          </div>

          <nav aria-label="Panel">
            <Link
              href="/admin"
              className="text-[13px] font-medium text-paper/70 transition-colors hover:text-volt"
            >
              Resumen
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20">{children}</main>
    </>
  );
}
