"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4F46E5", // Modern indigo
          color: "white",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)",
          transition: "all 0.3s ease",
        }}
        aria-label="Open Chatbot"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" /> // X icon when open
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" /> {/* Chat icon when closed */}
            </>
          )}
        </svg>
      </motion.button>

      {/* Chatbot Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              width: "380px",
              height: "600px",
              zIndex: 1000,
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              background: "white",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}>
              <iframe
                src="https://www.chatbase.co/chatbot-iframe/xas1WTH6TjlrM43qB3-Jg"
                width="100%"
                style={{ 
                  height: "100%",
                  border: "none",
                  borderRadius: "16px",
                }}
                title="Chatbot"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
