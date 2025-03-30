// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Layout/Navbar";

import Dashboard from "./components/Dashboard";
import Billings from "./components/Billings";

import NewInvoice from "./components/NewInvoice";
import Template from "./components/Template";

export default function App() {
  useEffect(() => {
    // Always enable dark mode
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");

    const stored = localStorage.getItem("userTemplateData");
    const parsed = stored ? JSON.parse(stored) : [];

    console.log("localStorage--->", parsed);
  }, []);

  return (
    <BrowserRouter>
      <div className="flex bg-cbg dark:bg-cbg-dark font-mono text-gray-600 dark:text-gf-dark">
        <Navbar />
        <main className="bg-cbg dark:bg-cbg-dark flex-1 ml-64 overflow-y-auto h-screen p-4">
          <Routes>
            {/* Root route for main dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Dynamic routes: /:company/... */}
            <Route
              path="/company/:company/new-invoice"
              element={<NewInvoice />}
            />
            <Route
              path="/company/:company/edit-invoice/:invoiceId"
              element={<NewInvoice />}
            />
            <Route path="/company/:company/billings" element={<Billings />} />
            <Route path="/company/:company/template" element={<Template />} />

            {/* Legacy routes - keeping for backward compatibility */}
            <Route path="/:company/new-template" element={<NewInvoice />} />
            <Route path="/:company/billings" element={<Billings />} />
            <Route path="/:company/template" element={<Template />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
