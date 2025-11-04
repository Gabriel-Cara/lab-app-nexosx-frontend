import { Helmet, HelmetProvider } from "@dr.pogodin/react-helmet";
import { ThemeProvider } from "./components/theme/theme-provider";

import { Routes } from "./routes";

import { Toaster } from "sonner";

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider storageKey="nexus-theme" defaultTheme="system">
        <Helmet titleTemplate="%s | nexus">
          <title>Nexus</title>
        </Helmet>

        <Routes />
        <Toaster richColors />
      </ThemeProvider>
    </HelmetProvider>
  );
}
