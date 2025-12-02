import { Helmet } from "@dr.pogodin/react-helmet";

export function Events() {
  return (
    <>
      <Helmet>
        <title>Eventos</title>
      </Helmet>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <header>
          <h1 className="text-2xl text-foreground font-bold tracking-tight">
            Eventos
          </h1>
          <p className="text-muted-foreground sr-only md:not-sr-only">
            Acompanhe os eventos do condomínio.
          </p>
        </header>
      </div>
    </>
  );
}
