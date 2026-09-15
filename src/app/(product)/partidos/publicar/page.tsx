import type { Metadata } from "next";
import { PublishMatchForm } from "@/components/app/publish-match-form";
import { PageHeader } from "@/components/app/page-header";
import { listClubs, listPlayers } from "@/lib/domain/repo";

export const metadata: Metadata = {
  title: "Publicar partido",
  description:
    "Publica tu partido de pádel y deja que se apunte quien falte.",
};

/**
 * Reads live data from the repository, so it must render per request. Without
 * this Next prerenders it at build time and the listing freezes on whatever was
 * true when the build ran.
 */
export const dynamic = "force-dynamic";

export default function PublishPage() {
  const { items: clubs } = listClubs({ limit: 50 });
  const players = listPlayers({ limit: 60 });

  return (
    <div className="shell pb-20">
      <PageHeader
        title="Publicar partido"
        lead="Di dónde, cuándo y a qué nivel. Quien encaje ocupará la plaza."
      />

      <div className="max-w-[46rem]">
        <PublishMatchForm
          clubs={clubs.map((c) => ({
            id: c.id,
            name: c.name,
            city: c.location.city,
            courts: c.courts.map((court) => ({
              id: court.id,
              name: court.name,
              pricePerSlot: court.pricePerSlot,
            })),
          }))}
          players={players.map((p) => ({
            id: p.id,
            name: p.name,
            level: p.level,
          }))}
        />
      </div>
    </div>
  );
}
