import { AppLayout } from "@/components/layout/app";
import { Dashboard } from "@/pages/app/dashboard";

import { Route, Routes } from "react-router";



export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}