
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Key } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  isFinalSummary: boolean;
  onSaveConversation: () => void;
  onUpdateApiKey: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isThinking,
  isFinalSummary,
  onSaveConversation,
  onUpdateApiKey
}) => {
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    onSendMessage(userInput);
    setUserInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-mi-light bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-4">
          {isFinalSummary && (
            <Button 
              onClick={onSaveConversation}
              variant="outline" 
              className="text-sm border-mi-primary text-mi-primary hover:bg-mi-light"
            >
              Save Conversation
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto text-xs border-mi-light text-mi-dark/70 hover:bg-mi-light flex items-center gap-1"
            onClick={onUpdateApiKey}
          >
            <Key className="h-3 w-3" />
            Update API Key
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 resize-none focus-visible:ring-mi-primary"
            rows={2}
            disabled={isThinking}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            disabled={!userInput.trim() || isThinking}
            className="bg-mi-primary hover:bg-mi-primary/80"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-2 text-center">
          <a 
            href="https://www.buymeacoffee.com/KouHzyPEc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-mi-dark/50 hover:text-mi-primary"
          >
            Support this project ❤️
          </a>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
