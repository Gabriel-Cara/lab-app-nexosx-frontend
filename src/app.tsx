import { Helmet, HelmetProvider } from "@dr.pogodin/react-helmet";
import { ThemeProvider } from "./components/theme/theme-provider";

import { Routes } from "./routes";

import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { AuthProvider } from "./contexts/auth-context";

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider storageKey="nexus-theme" defaultTheme="system">
        <Helmet titleTemplate="%s | nexus">
          <title>Nexus</title>
        </Helmet>
        
        <Toaster richColors />

        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
