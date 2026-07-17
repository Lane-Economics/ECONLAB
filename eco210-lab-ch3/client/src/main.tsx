import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import EconLab from "./pages/EconLab";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EconLab
      courseTitle="ECO 210 ECONLAB"
      courseSubtitle="Chapter 3 — Demand and Supply"
      hubUrl="https://www.perplexity.ai/computer/a/econlab-hub-JgrfOPjHQ5iSYovw19FfIg"
    />
  </StrictMode>
);
