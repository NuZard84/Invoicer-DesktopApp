import React from "react";
import { NavLink } from "react-router-dom";
import { House, LayoutTemplate, Plus, ReceiptText } from "lucide-react";

const Navbar: React.FC = () => {
  const nav_links = [
    {
      to: "/",
      text: "Dashboard",

      icon: <House size={20} />,
    },
    {
      to: "/billings",
      text: "Billings",
      icon: <ReceiptText size={20} />,
    },
    {
      to: "/template",
      text: "Change template",
      icon: <LayoutTemplate size={20} />,
    },
  ];
  return (
    <nav className="fixed w-64 h-screen bg-bg text-gf p-4 shadow-md">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-dp">Invoicer</h1>
      </div>
      <NavLink
        to={"/new-template"}
        className="flex mb-6 bg-dp p-2 text-white rounded-lg items-center justify-center gap-2 flex-row hover:bg-lp hover:text-dp cursor-pointer transition-all duration-200 border-[1px] border-white  hover:border-dp"
      >
        <span>
          <Plus size={18} />
        </span>
        New Invoice
      </NavLink>
      <ul className="space-y-4">
        {nav_links?.map((link, i) => {
          return (
            <li key={i}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `transition-all duration-200 flex-row gap-2 flex p-2 rounded items-center  ${
                    isActive
                      ? "bg-lp text-dp  rounded-md"
                      : "hover:bg-dp hover:text-bg"
                  }`
                }
              >
                <span>{link.icon}</span>
                {link.text}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
