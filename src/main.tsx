import { RootLayout } from "@/layout";
import { Index } from "@/page";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import AuthLayout from "./pages/auth/layout";
import AuthPage from "./pages/auth/page";
import { DashboardLayout } from "./pages/dashboard/layout";
import DashboardPage from "./pages/dashboard/page";
import EmailCheckLayout from "./pages/email-check/layout";
import EmailCheckPage from "./pages/email-check/page";
import { ProfileLayout } from "./pages/profile/layout";
import ProfilePage from "./pages/profile/page";
import RecoverPasswordLayout from "./pages/recover-password/layout";
import RecoverPasswordPage from "./pages/recover-password/page";
import InventoryLayout from "./pages/inventory/layout";
import Inventory from "./pages/inventory/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout children={<Index />} />}></Route>
        <Route
          path="/auth"
          element={<AuthLayout children={<AuthPage />} />}
        ></Route>
        <Route
          path="/recover-password"
          element={<RecoverPasswordLayout children={<RecoverPasswordPage />} />}
        ></Route>
        <Route
          path="/email-check"
          element={<EmailCheckLayout children={<EmailCheckPage />} />}
        ></Route>
        <Route
          path="/dashboard"
          element={
            <SidebarProvider>
              <DashboardLayout children={<DashboardPage />} />
            </SidebarProvider>
          }
        ></Route>
        <Route
          path="/profile"
          element={
            <SidebarProvider>
              <ProfileLayout children={<ProfilePage />} />
            </SidebarProvider>
          }
        ></Route>
        <Route
          path="/inventory"
          element={
            <SidebarProvider>
              <InventoryLayout children={<Inventory />} />
            </SidebarProvider>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
