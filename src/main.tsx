import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { TOAST_DURATION_MS } from "./constants";
import "./styles/index.css";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ duration: TOAST_DURATION_MS }}
      />
    </ErrorBoundary>
  </StrictMode>
);
