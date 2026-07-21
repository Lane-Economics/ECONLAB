import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import EconLab from "./pages/EconLab";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EconLab
      courseTitle="ECO 210 ECONLAB"
      courseSubtitle="Chapter 2 — Choice In A World Of Scarcity"
      hubUrl="https://eco210-econlab-hub.pplx.app"
    />
  </StrictMode>
);
