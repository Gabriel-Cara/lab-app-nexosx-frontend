import { AuthLayout } from "@/components/layout/auth";

import { Route, Routes } from "react-router";

import { SignIn } from "../pages/auth/sign-in";
import { SignUp } from "../pages/auth/sign-up";

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route path="/" element={<SignIn />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Route>
    </Routes>
  )
}