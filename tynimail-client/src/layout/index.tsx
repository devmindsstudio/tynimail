import React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

const TyniMailLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <div className="flex-1 overflow-auto bg-background p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TyniMailLayout;
