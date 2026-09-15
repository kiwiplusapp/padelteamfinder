import { SiteNav } from "@/components/marketing/site-nav";
import { Hero } from "@/components/marketing/hero";
import { LiveMatches } from "@/components/marketing/live-matches";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { TournamentsBento } from "@/components/marketing/tournaments-bento";
import { BracketPan } from "@/components/marketing/bracket-pan";
import { ClubsSplit } from "@/components/marketing/clubs-split";
import { ForClubs } from "@/components/marketing/for-clubs";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { bracketByRound, listTournaments } from "@/lib/domain/repo";

/* ----------------------------------------------------------------------------
   Landing composition.

   Eight sections, eight distinct layout families, in this order:
     1 hero split over WebGL   2 horizontal rail        3 editorial stack
     4 bento grid              5 pinned horizontal pan  6 split screen
     7 full-width statement    8 closing statement

   Eyebrow budget: 8 sections allows 2 by the one-per-three rule. Two are used,
   on sections 4 and 7. Marquee budget: one, in section 7.
   -------------------------------------------------------------------------- */

/**
 * Reads live data from the repository, so it must render per request. Without
 * this Next prerenders it at build time and the listing freezes on whatever was
 * true when the build ran.
 */
export const dynamic = "force-dynamic";

export default function HomePage() {
  // The bracket showcase runs on a real draw that already has results.
  const live = listTournaments({ status: "en-juego", limit: 1 }).items[0];
  const showcaseDraw = live?.draws[0];
  const rounds = showcaseDraw ? bracketByRound(showcaseDraw.id) : [];

  return (
    <>
      <SiteNav />

      <main id="contenido">
        <Hero />
        <LiveMatches />
        <HowItWorks />
        <TournamentsBento />

        {rounds.length > 0 && live && showcaseDraw && (
          <BracketPan
            rounds={rounds}
            tournamentName={live.name}
            drawName={showcaseDraw.name}
          />
        )}

        <ClubsSplit />
        <ForClubs />
        <ClosingCta />
      </main>
    </>
  );
}
