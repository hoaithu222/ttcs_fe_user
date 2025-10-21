import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import AppRoot from "./AppRoot.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <AppRoot />
    </Suspense>
  </StrictMode>
);
