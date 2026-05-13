import { navigations } from "@/data/sidebar";
import React from "react";
import { NavLink } from "react-router";
import { PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CompactSidebar: React.FC<{
  hanlderChangePanel: () => void;
  className: any;
}> = ({ hanlderChangePanel, className }) => {
  return (
    <TooltipProvider>
      <aside
        className={`w-full max-w-[75px] py-6 px-4 border-r border-border  flex-col relative ${
          className ?? ""
        }`}
      >
        {/* Logo */}
        <div className="icon ml-2">
          <div className="w-auto max-w-10">
            <img
              src="/short-logo.png"
              alt="Logo"
              className="block dark:hidden"
            />
            <img
              src="/short-logo-white.png"
              className="dark:block hidden"
              alt="Logo"
            />
          </div>
        </div>

        {/* Toggle button */}
        <div
          className="hidden w-6 h-6 absolute top-[65px] -right-3 cursor-pointer z-10  bg-background text-primary lg:flex items-center justify-center"
          onClick={hanlderChangePanel}
        >
          <PanelLeftOpen className="text-xl" />
        </div>

        {/* Navigation */}
        <div className="mt-10 overflow-y-auto flex-1 remove-side-barscrollbar">
          <ul className="grid gap-3">
            {navigations.map((item, index) => (
              <li key={index} className="group">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink to={item.link} className="outline-none">
                      {({ isActive }) => (
                        <div
                          className={`w-10 h-10 flex justify-center items-center rounded-md group  ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-sidebar-backgdoud  text-foreground "
                          }`}
                        >
                          <div
                            className={`w-5 h-5 transition  ${
                              isActive
                                ? "stroke-primary-foreground fill-primary-foreground"
                                : "group-hover:stroke-foreground group-hover:fill-foreground stroke-foreground fill-foreground"
                            }`}
                          >
                            {item.icon}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={10}
                    side="right"
                    className=" shadow-sidebar1 border border-border bg-popover text-foreground font-medium text-sm leading-5 font-inter px-2 py-1"
                  >
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default CompactSidebar;
