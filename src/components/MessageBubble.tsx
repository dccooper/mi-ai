
import React from "react";
import { Message } from "../types/mi-types";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === "user";
  
  return (
    <div 
      className={`message-bubble ${isUser ? "user-message" : "ai-message"}`}
    >
      <div className="flex items-start gap-2">
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-mi-primary flex items-center justify-center text-white text-xs font-bold">
            MI
          </div>
        )}
        <div className="flex-1">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
