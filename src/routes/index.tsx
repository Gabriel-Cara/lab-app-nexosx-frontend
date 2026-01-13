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
const StaffSignUp = lazy(() =>
  import("@/pages/auth/staff-sign-up").then((module) => ({
    default: module.StaffSignUp,
  }))
);
const ForgotPassword = lazy(() =>
  import("@/pages/auth/forgot-password").then((module) => ({
    default: module.ForgotPassword,
  }))
);
const ResetPassword = lazy(() =>
  import("@/pages/auth/reset-password").then((module) => ({
    default: module.ResetPassword,
  }))
);
const ResidentSignUp = lazy(() =>
  import("@/pages/auth/resident-sign-up").then((module) => ({
    default: module.ResidentSignUp,
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

  const resolveDefaultPath = useCallback((role?: Role) => {
    if (role === "master") {
      return "/master/requests";
    }

    return "/dashboard";
  }, []);

  const guard = useCallback(
    (allowedRoles?: Role[]) =>
      () => {
        if (!session) {
          throw redirect("/sign-in");
        }

        if (allowedRoles && !allowedRoles.includes(session.user.role)) {
          throw redirect(resolveDefaultPath(session.user.role));
        }

        return null;
      },
    [resolveDefaultPath, session]
  );

  const publicGuard = useCallback(() => {
    if (session) {
      throw redirect(resolveDefaultPath(session.user.role));
    }
    return null;
  }, [resolveDefaultPath, session]);

  const indexGuard = useCallback(() => {
    if (!session) {
      throw redirect("/sign-in");
    }
    throw redirect(resolveDefaultPath(session.user.role));
  }, [resolveDefaultPath, session]);

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
            { path: "esqueci-senha", element: withSuspense(<ForgotPassword />) },
            { path: "redefinir-senha", element: withSuspense(<ResetPassword />) },
            { path: "primeiro-acesso", element: withSuspense(<FirstAccess />) },
            { path: "cadastro-equipe", element: withSuspense(<StaffSignUp />) },
            { path: "cadastro-morador", element: withSuspense(<ResidentSignUp />) },
          ],
        },
        {
          path: "/",
          element: <AppLayout />,
          children: [
            {
              index: true,
              loader: indexGuard,
              element: <RouteFallback />,
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
    [guard, indexGuard, publicGuard],
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
