import React from "react";
import { motion } from "framer-motion";
import { BsExclamationCircleFill } from "react-icons/bs";

export default function AlertError({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 50, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.8 }}
      className="fixed top-0 left-0 w-full z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className="bg-white/90 backdrop-blur-xl border border-red-200/50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-[90vw] pointer-events-auto">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <BsExclamationCircleFill className="text-xl text-red-500" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-bold text-gray-800">Error</p>
          <p className="text-sm font-medium text-gray-500 truncate">
            {msg?.length > 50 ? `${msg?.slice(0, 50)}...` : msg}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
