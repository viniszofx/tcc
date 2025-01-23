import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { RootLayout } from "@/layout";
import { Index } from "@/page";
import { AuthPage } from "./pages/auth/page";
import { AuthLayout } from "./pages/auth/layout";
import { CameraPage } from "./pages/camera/page";
import { AppPage } from "./pages/app/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout children={<Index />} />}></Route>
        <Route
          path="/auth"
          element={<AuthLayout children={<AuthPage />} />}
        ></Route>
        <Route path="/cam" element={<CameraPage />}></Route>
        <Route path="/app" element={<AppPage />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
