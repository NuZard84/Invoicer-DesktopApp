// Navbar.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  ReceiptText,
  LayoutTemplate,
  Plus,
  Moon,
  Sun,
} from "lucide-react";

const Navbar: React.FC = () => {
  // Dark Mode State
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

  const companies = [
    { name: "DHANCHHA" },
    { name: "RACHANA" },
    { name: "MITAL" },
  ];

  const subRoutes = [
    {
      label: "New Invoice",
      path: "new-template",
      icon: <Plus size={18} />,
    },
    {
      label: "Billings",
      path: "billings",
      icon: <ReceiptText size={18} />,
    },

    {
      label: "Template",
      path: "template",
      icon: <House size={18} />,
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

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

      <ul className="space-y-4">
        {companies.map((company, index) => {
          const isOpen = expandedIndex === index;
          return (
            <li key={company.name}>
              <div
                onClick={() => handleToggle(index)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${
                    isOpen
                      ? "bg-lp text-dp dark:bg-gray-600 dark:text-white"
                      : "hover:bg-dp hover:text-white dark:hover:bg-gray-700"
                  }
                `}
              >
                <span className="font-semibold">{company.name}</span>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4 mt-2 flex flex-col space-y-2"
                  >
                    {subRoutes.map((route) => {
                      const fullPath = `/${company.name.toLowerCase()}/${
                        route.path
                      }`;
                      return (
                        <li key={route.label}>
                          <NavLink
                            to={fullPath}
                            className={({ isActive }) =>
                              `flex items-center gap-2 p-2 rounded-lg
                              transition-all duration-200
                              ${
                                isActive
                                  ? "bg-lp text-dp dark:bg-gray-600 dark:text-white"
                                  : "hover:bg-dp hover:text-white dark:hover:bg-gray-700"
                              }`
                            }
                          >
                            {route.icon}
                            <span>{route.label}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
