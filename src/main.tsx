import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { RootLayout } from "@/layout";
import { Index } from "@/page";
import DashboardPage from "./pages/dashboard/page";
import { DashboardLayout } from "./pages/dashboard/layout";
import { SidebarProvider } from "./components/ui/sidebar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout children={<Index />} />}></Route>
        <Route path="/dashboard" element={
          <SidebarProvider>
            <DashboardLayout children={<DashboardPage />} />
          </SidebarProvider>
        }></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);