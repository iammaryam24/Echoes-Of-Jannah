import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = "Loading...", fullScreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-aurora border-t-transparent rounded-full"
      />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-cosmic/90 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}