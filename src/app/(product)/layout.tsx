import { SiteNav } from "@/components/marketing/site-nav";
import { TabBar } from "@/components/app/tab-bar";

/**
 * Product shell. Same header as the marketing site so the brand does not
 * change identity on the way in, plus a thumb-reach tab bar on phones. The
 * bottom margin reserves the tab bar's height so nothing hides behind it.
 */
export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="mb-tabbar flex-1">{children}</main>
      <TabBar />
    </>
  );
}
