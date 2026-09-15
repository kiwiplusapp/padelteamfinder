import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { CreateTournamentForm } from "@/components/app/create-tournament-form";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/states";
import { listClubs } from "@/lib/domain/repo";

export const metadata: Metadata = { title: "Crear torneo" };

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const requested = Array.isArray(sp.club) ? sp.club[0] : sp.club;

  const { items: clubs } = listClubs({ limit: 50 });
  const club = clubs.find((c) => c.id === requested) ?? clubs[0];

  if (!club) {
    return (
      <div className="shell">
        <PageHeader title="Crear torneo" />
        <EmptyState
          title="No hay ningún club disponible"
          body="Vuelve al panel y selecciona un club."
          actionLabel="Ir al panel"
          actionHref="/admin"
        />
      </div>
    );
  }

  return (
    <div className="shell">
      <Link
        href={`/admin?club=${club.id}`}
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/60 transition-colors hover:text-volt"
      >
        <ArrowLeft size={14} weight="bold" />
        Panel
      </Link>

      <PageHeader
        title="Crear torneo"
        lead={`Se publicará en ${club.name} y aparecerá en la web y en la API.`}
      />

      <div className="max-w-[52rem] pb-10">
        <CreateTournamentForm clubId={club.id} />
      </div>
    </div>
  );
}
