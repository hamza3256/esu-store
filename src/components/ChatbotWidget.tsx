"use client"
import { useState } from "react";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        }}
        aria-label="Open Chatbot"
      >
        💬
      </button>

      {/* Chatbot Iframe */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "400px",
            height: "600px",
            zIndex: 1000,
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/xas1WTH6TjlrM43qB3-Jg"
            width="100%"
            style={{ height: "100%", borderRadius: "8px" }}
            frameBorder="0"
            title="Chatbot"
          ></iframe>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
