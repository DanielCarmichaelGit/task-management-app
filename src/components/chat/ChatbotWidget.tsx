"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getAuth } from "@/lib/api";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

export function ChatbotWidget({ isOpen }: ChatbotWidgetProps) {
  const { user } = useAuth();
  const { token } = getAuth();

  useEffect(() => {
    // Initialize n8n chat when component mounts
    createChat({
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "",
      metadata: {
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.user_metadata?.full_name,
        },
        token,
      },
      initialMessages: [
        `Hi, ${user?.user_metadata?.full_name} 👋`,
        "How can upward assist you today?",
      ]
    });
  }, []); // Empty dependency array - run once on mount

  return (
    token ? (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full">
            {/* n8n Chat will be rendered here */}
            <div id="n8n-chat-container" className="h-full w-full" />
          </div>
        </div>
      </div>
    ) : (
      null
    )
  );
}
