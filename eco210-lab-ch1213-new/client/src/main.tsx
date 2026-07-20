import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EconLab from "./pages/EconLab";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EconLab
      courseTitle="ECO 210 ECONLAB"
      courseSubtitle="Chapters 12 & 13 — Keynesian & Neoclassical Perspectives"
      hubUrl="https://eco210-econlab-hub.pplx.app"
    />
  </StrictMode>
);
