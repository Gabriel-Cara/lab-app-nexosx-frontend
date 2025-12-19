import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router";
import { useMemo } from "react";

import { AuthLayout } from "@/components/layout/auth";
import { AppLayout } from "@/components/layout/app";
import { SignIn } from "@/pages/auth/sign-in";
import { SignUp } from "@/pages/auth/sign-up";
import { FirstAccess } from "@/pages/auth/first-access";
import { Dashboard } from "@/pages/app/dashboard";
import { useAuth } from "@/hooks/use-auth";
import { appRouteDefinitions } from "@/routes/config";
import { NotFound } from "@/pages/not-found";

type Role = "admin" | "staff" | "resident";

export function Routes() {
  const { session, isLoading } = useAuth();

  const guard =
    (allowedRoles?: Role[]) =>
    () => {
      if (!session) {
        throw redirect("/sign-in");
      }

      if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        throw redirect("/dashboard");
      }

      return null;
    };

  const publicGuard = () => {
    if (session) {
      throw redirect("/dashboard");
    }
    return null;
  };

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <AuthLayout />,
          loader: publicGuard,
          children: [
            { index: true, element: <SignIn /> },
            { path: "sign-in", element: <SignIn /> },
            { path: "sign-up", element: <SignUp /> },
            { path: "primeiro-acesso", element: <FirstAccess /> },
          ],
        },
        {
          path: "/",
          element: <AppLayout />,
          children: [
            {
              index: true,
              loader: guard(["admin", "staff", "resident"]),
              element: <Dashboard />,
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
          element: <NotFound />
        }
      ]),
    [session],
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
