import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  LayoutTemplate,
  Plus,
  ReceiptText,
  Moon,
  Sun,
} from "lucide-react";

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const nav_links = [
    { to: "/", text: "Dashboard", icon: <House size={20} /> },
    { to: "/billings", text: "Billings", icon: <ReceiptText size={20} /> },
    {
      to: "/template",
      text: "Change Template",
      icon: <LayoutTemplate size={20} />,
    },
  ];

  return (
    <nav className="fixed w-64 h-screen bg-bg dark:bg-bg-dark text-gf dark:text-gf-dark p-4 shadow-md">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold text-dp dark:text-dp">Invoicer</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <NavLink
        to={"/new-template"}
        className="flex mb-6 bg-dp p-2 text-white rounded-lg items-center justify-center gap-2 flex-row 
        hover:bg-lp dark:hover:bg-lp-dark hover:text-dp cursor-pointer transition-all duration-200 border-[1px] border-white dark:border-gray-700 dark:hover:border-dp"
      >
        <span>
          <Plus size={18} />
        </span>
        New Invoice
      </NavLink>

      <ul className="space-y-4">
        {nav_links.map((link, i) => (
          <li key={i}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `transition-all duration-200 flex-row gap-2 flex p-2 rounded-lg items-center 
                ${
                  isActive
                    ? "bg-lp text-dp dark:bg-gray-600 dark:text-white"
                    : "hover:bg-dp hover:text-bg dark:hover:bg-gray-700 dark:hover:text-white"
                }`
              }
            >
              <span>{link.icon}</span>
              {link.text}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
