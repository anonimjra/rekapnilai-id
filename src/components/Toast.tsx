"use client";

import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-600" />,
    error: <AlertCircle size={20} className="text-red-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  const bgColors = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-emerald-800",
    error: "text-red-800",
    info: "text-blue-800",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]} animate-slideIn`}
    >
      {icons[type]}
      <p className={`text-sm font-medium ${textColors[type]}`}>{message}</p>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </div>
  );
};
