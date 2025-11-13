import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import AppRoot from "./AppRoot.tsx";
import { Loading } from "./foundation/components/loading";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<Loading variant="spinner" layout="fullscreen" size="sm" />}>
      <AppRoot />
    </Suspense>
  </StrictMode>
);
