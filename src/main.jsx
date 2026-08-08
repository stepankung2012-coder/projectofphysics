import React from "react";
import { createRoot } from "react-dom/client";
import { Global, css } from "@emotion/react";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Global
      styles={css`
        :root {
          color: #172033;
          background: #ffffff;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          --blue: #2563eb;
          --blue-soft: #eff6ff;
          --line: #e6eaf0;
          --muted: #64748b;
          --ink: #172033;
          --panel: #f8fafc;
          --green: #16a34a;
          --amber: #d97706;
          --red: #dc2626;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-width: 320px;
          min-height: 100vh;
          background: #ffffff;
        }

        button,
        textarea,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }
      `}
    />
    <App />
  </React.StrictMode>,
);
