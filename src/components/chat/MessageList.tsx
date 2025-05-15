
import React, { useRef, useEffect } from "react";
import { Message } from "../../types/mi-types";
import MessageBubble from "../MessageBubble";

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isThinking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col max-w-3xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isThinking && (
          <div className="message-bubble ai-message animate-pulse-slow">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-mi-primary flex items-center justify-center text-white text-xs">
                MI
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-mi-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-mi-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-mi-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
