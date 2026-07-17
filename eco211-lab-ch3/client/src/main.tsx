import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EconLab from "./pages/EconLab";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EconLab
      courseTitle="ECO 211 ECONLAB"
      courseSubtitle="Chapter 3 — Demand and Supply"
      hubUrl="https://www.perplexity.ai/computer/a/eco211-hub-h76o7OX6SpisjlWADnIRGg"
    />
  </StrictMode>
);
