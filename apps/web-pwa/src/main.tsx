import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@gdash/ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
