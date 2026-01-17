import React from "react";

export default function Loader() {
  return (
    <div className="flex z-50 w-full h-screen fixed top-0 left-0 bg-white/30 backdrop-blur-md items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-blue-100 animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full blur-xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
}
