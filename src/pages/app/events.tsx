import { Helmet } from "@dr.pogodin/react-helmet";

import { EventsAdmin } from "@/components/events/admin";
import { EventsFeed } from "@/components/events/feed";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";

export function Events() {
  const { session } = useAuth();
  const isResident = session?.user.role === "resident";

  return (
    <>
      <Helmet>
        <title>Eventos</title>
      </Helmet>
      <main className="flex min-h-0 flex-1 flex-col gap-8">
        {isResident ? (
          <>
            <PageHeader
              title="Eventos"
              description="Acompanhe os eventos do condomínio."
            />
            <EventsFeed />
          </>
        ) : (
          <EventsAdmin />
        )}
      </main>
    </>
  );
}
