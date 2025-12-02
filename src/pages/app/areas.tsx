import { Helmet } from "@dr.pogodin/react-helmet";

export function Areas() {
  return (
    <>
      <Helmet>
        <title>Áreas de lazer</title>
      </Helmet>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <header>
          <h1 className="text-2xl text-foreground font-bold tracking-tight">
            Áreas de Lazer
          </h1>
          <p className="text-muted-foreground sr-only md:not-sr-only">
            Agende as áreas comuns do condomínio.
          </p>
        </header>
      </div>
    </>
  );
}
