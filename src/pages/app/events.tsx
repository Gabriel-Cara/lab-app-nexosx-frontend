import { Helmet } from "@dr.pogodin/react-helmet";

import { EventsAdmin } from "@/components/events/admin";
import { EventsFeed } from "@/components/events/feed";
import { useAuth } from "@/hooks/use-auth";

export function Events() {
  const { session } = useAuth();
  const isResident = session?.user.role === "resident";

  return (
    <>
      <Helmet>
        <title>Eventos</title>
      </Helmet>
      <main className="flex min-h-svh flex-col gap-8">
        {isResident ? (
          <>
            <header className="space-y-2">
              <h1 className="text-2xl text-foreground font-bold tracking-tight">
                Eventos
              </h1>
              <p className="text-muted-foreground">
                Acompanhe os eventos do condomínio.
              </p>
            </header>
            <EventsFeed />
          </>
        ) : (
          <EventsAdmin />
        )}
      </main>
    </>
  );
}
