import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router";
import { lazy, Suspense, useCallback, useMemo, type ReactNode } from "react";

import { AuthLayout } from "@/components/layout/auth";
import { AppLayout } from "@/components/layout/app";
import { useAuth } from "@/hooks/use-auth";
import { appRouteDefinitions, type Role } from "@/routes/config";
import { RouteFallback } from "@/routes/route-fallback";

const SignIn = lazy(() =>
  import("@/pages/auth/sign-in").then((module) => ({ default: module.SignIn }))
);
const SignUp = lazy(() =>
  import("@/pages/auth/sign-up").then((module) => ({ default: module.SignUp }))
);
const FirstAccess = lazy(() =>
  import("@/pages/auth/first-access").then((module) => ({
    default: module.FirstAccess,
  }))
);
const NotFound = lazy(() =>
  import("@/pages/not-found").then((module) => ({ default: module.NotFound }))
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

export function Routes() {
  const { session, isLoading } = useAuth();

  const guard = useCallback(
    (allowedRoles?: Role[]) =>
      () => {
        if (!session) {
          throw redirect("/sign-in");
        }

        if (allowedRoles && !allowedRoles.includes(session.user.role)) {
          throw redirect("/dashboard");
        }

        return null;
      },
    [session]
  );

  const publicGuard = useCallback(() => {
    if (session) {
      throw redirect("/dashboard");
    }
    return null;
  }, [session]);

  const dashboardRoute = appRouteDefinitions.find(
    (route) => route.id === "dashboard",
  );

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <AuthLayout />,
          loader: publicGuard,
          children: [
            { index: true, element: withSuspense(<SignIn />) },
            { path: "sign-in", element: withSuspense(<SignIn />) },
            { path: "sign-up", element: withSuspense(<SignUp />) },
            { path: "primeiro-acesso", element: withSuspense(<FirstAccess />) },
          ],
        },
        {
          path: "/",
          element: <AppLayout />,
          children: [
            {
              index: true,
              loader: guard(["admin", "staff", "resident"]),
              element: dashboardRoute?.element ?? <RouteFallback />,
            },
            ...appRouteDefinitions.map((route) => ({
              path: route.path,
              loader: guard(route.roles),
              element: route.element,
            })),
          ],
        },
        {
          path: "*",
          element: withSuspense(<NotFound />),
        }
      ]),
    [dashboardRoute, guard, publicGuard],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
