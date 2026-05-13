import React from "react";

const ModelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overlay">
      <div className="bg-black/10 backdrop-blur-xs fixed inset-0 z-10 h-full w-full overflow-x-hidden">
        <div className="flex justify-center items-center min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModelLayout;
