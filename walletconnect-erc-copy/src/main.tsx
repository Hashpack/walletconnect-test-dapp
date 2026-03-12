import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Web3Provider } from "./Web3Provider";
import { LoggerProvider } from "./hooks/useLogger";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoggerProvider>
      <Web3Provider>
        <App />
      </Web3Provider>
    </LoggerProvider>
  </StrictMode>
);
