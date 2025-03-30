import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";

// Enable dark mode immediately
document.documentElement.classList.add("dark");
localStorage.setItem("theme", "dark");

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
