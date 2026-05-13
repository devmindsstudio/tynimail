import { navigations } from "@/data/sidebar";
import React, { useState } from "react";
import { NavLink } from "react-router";
import { PanelLeftOpen } from "lucide-react";
import CompactSidebar from "./sidebar-collpase";

const Sidebar: React.FC = () => {
  const [openSidebarPanel, setOpenSidebarPanel] = useState<boolean>(true);
  const hanlderChangePanel = () => {
    setOpenSidebarPanel(!openSidebarPanel);
  };
  return (
    <React.Fragment>
      {openSidebarPanel ? (
        <aside
          className={`hidden w-full  max-w-61 py-8 px-6 border-r border-border lg:flex flex-col relative`}
        >
          <div className="icon ml-2">
            <NavLink to="/" className="w-auto max-w-35 bg-red-500">
              <img
                src="/Logo_Black.svg"
                alt="Logo"
                className="block dark:hidden"
              />
              <img
                src="/Logo_White.svg"
                className="dark:block hidden"
                alt="Logo"
              />
            </NavLink>
          </div>

          <div
            className="w-6 h-6 absolute top-25 -right-3 cursor-pointer z-1 bg-background text-primary"
            onClick={hanlderChangePanel}
          >
            <PanelLeftOpen className="text-xl" />
          </div>
          <div className="mt-8 overflow-y-auto flex-1 remove-side-barscrollbar">
            <ul className="grid gap-1">
              {navigations.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      `flex items-center gap-2 py-2 px-3 rounded-md   group ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-sidebar-backgdoud  text-foreground "
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className={`w-5 h-5 transition  ${
                            isActive
                              ? "stroke-primary-foreground fill-primary-foreground"
                              : "group-hover:stroke-foreground group-hover:fill-foreground stroke-foreground fill-foreground"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <p className="font-semibold text-sm leading-6">
                          {item.name}
                        </p>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      ) : (
        <CompactSidebar
          className="flex"
          hanlderChangePanel={hanlderChangePanel}
        />
      )}
      <CompactSidebar
        className="flex lg:hidden"
        hanlderChangePanel={hanlderChangePanel}
      />
    </React.Fragment>
  );
};

export default Sidebar;
