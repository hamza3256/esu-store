"use client"
import { useState } from "react";
import { Button } from "./ui/button";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotWidgetProps {
  className?: string;
}

const ChatbotWidget = ({ className }: ChatbotWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-4 right-4 z-30", className)}>
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-black hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white rounded-lg shadow-lg p-4">
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/esu-store-chatbot-aqxqmxqxw"
            width="100%"
            height="100%"
            frameBorder="0"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
