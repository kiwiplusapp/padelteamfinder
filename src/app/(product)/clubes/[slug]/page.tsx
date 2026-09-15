import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { MatchCard } from "@/components/app/match-card";
import { PageHeader } from "@/components/app/page-header";
import { TournamentCard } from "@/components/app/tournament-card";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/states";
import { CLUB_COVERS, photo } from "@/data/images";
import {
  getClubView,
  listMatches,
  listTournaments,
} from "@/lib/domain/repo";
import { AMENITY_LABEL } from "@/lib/domain/schemas";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const club = getClubView(slug);
  if (!club) return { title: "Club no encontrado" };
  return {
    title: club.name,
    description: `${club.courts.length} pistas de pádel en ${club.location.city}. Partidos abiertos y torneos.`,
  };
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = getClubView(slug);
  if (!club) notFound();

  const matches = listMatches({ limit: 60 }).items.filter(
    (m) => m.clubId === club.id,
  );
  const tournaments = listTournaments({ clubId: club.id, limit: 6 }).items;

  return (
    <div className="pb-20">
      <div className="relative h-[38vh] min-h-[240px] w-full overflow-hidden">
        <Photo
          slot={CLUB_COVERS[club.id] ?? photo(club.slug, 1600, 900)}
          alt=""
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cobalt-900 via-cobalt-900/70 to-cobalt-900/25" />
      </div>

      <div className="shell relative -mt-20">
        <Link
          href="/clubes"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/70 transition-colors hover:text-volt"
        >
          <ArrowLeft size={14} weight="bold" />
          Clubes
        </Link>

        {club.affiliated && (
          <div className="mt-5">
            <Badge tone="accent">Club afiliado</Badge>
          </div>
        )}

        <PageHeader title={club.name} />

        <div className="rule-t grid gap-8 py-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <dl className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <dt className="mt-0.5">
                  <MapPin size={16} weight="bold" className="text-paper/45" />
                  <span className="sr-only">Dirección</span>
                </dt>
                <dd className="text-sm leading-relaxed text-paper/75">
                  {club.location.address}
                  <br />
                  {club.location.postalCode} {club.location.city},{" "}
                  {club.location.region}
                </dd>
              </div>

              {club.openingHours && (
                <div className="flex items-start gap-2.5">
                  <dt className="mt-0.5">
                    <Clock size={16} weight="bold" className="text-paper/45" />
                    <span className="sr-only">Horario</span>
                  </dt>
                  <dd className="text-sm text-paper/75">{club.openingHours}</dd>
                </div>
              )}

              {club.phone && (
                <div className="flex items-start gap-2.5">
                  <dt className="mt-0.5">
                    <Phone size={16} weight="bold" className="text-paper/45" />
                    <span className="sr-only">Teléfono</span>
                  </dt>
                  <dd>
                    <a
                      href={`tel:${club.phone.replace(/\s/g, "")}`}
                      className="nums text-sm text-paper/75 transition-colors hover:text-volt"
                    >
                      {club.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {club.amenities.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2">
                {club.amenities.map((a) => (
                  <li key={a}>
                    <Badge tone="outline">{AMENITY_LABEL[a]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-5">
            <h2 className="font-display text-xl leading-none">
              Pistas ({club.courts.length})
            </h2>
            <ul className="mt-5 flex flex-col">
              {club.courts.map((court) => (
                <li
                  key={court.id}
                  className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-semibold">{court.name}</p>
                    <p className="text-xs text-paper/55">
                      {court.indoor ? "Cubierta" : "Exterior"}
                      {court.panoramic && " / Panorámica"}
                    </p>
                  </div>
                  <span className="nums shrink-0 text-sm text-paper/70">
                    {formatMoney(court.pricePerSlot)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="rule-t py-8">
          <h2 className="font-display text-2xl leading-none">
            Partidos en este club
          </h2>
          {matches.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="Ahora mismo no hay partidos aquí"
              body="Publica el tuyo y quien juegue en este club lo verá."
              actionLabel="Publicar partido"
              actionHref="/partidos/publicar"
            />
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {matches.slice(0, 6).map((match) => (
                <li key={match.id} className="flex">
                  <MatchCard match={match} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {tournaments.length > 0 && (
          <section className="rule-t py-8">
            <h2 className="font-display text-2xl leading-none">Torneos</h2>
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {tournaments.map((t) => (
                <li key={t.id} className="flex">
                  <TournamentCard tournament={t} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
