"use client";

import { X } from "lucide-react";
import { Button } from "./Button";

interface LoadingOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  message?: string;
}

export function LoadingOverlay({
  isVisible,
  onClose,
  message = "We are enhancing your task. You can safely close the drawer and we will update the task list when complete.",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-100">
            AI Enhancement in Progress
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Loading animation */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Message */}
        <p className="text-slate-300 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Progress bar */}
        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Additional info */}
        <div className="text-center">
          <p className="text-sm text-slate-400">
            This may take several minutes depending on the complexity of your
            task.
          </p>
        </div>
      </div>
    </div>
  );
}
