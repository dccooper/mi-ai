import React from "react";
import { useMI } from "../context/MIContext";
import { Save } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const { resetConversation, saveConversation, state } = useMI();
  const { messages, isFinalSummary } = state;

  const handleSaveConversation = () => {
    // Convert messages to readable text format
    const conversationText = messages
      .map(msg => `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    // Create and download text file
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-mi-light">
      <div className="flex items-center">
        <div className="text-mi-primary text-2xl font-bold mr-2">MI-AI</div>
        <h1 className="text-xl font-semibold text-mi-dark">
          Motivational <span className="text-mi-primary">Interviewing</span> Assistant
        </h1>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={handleSaveConversation}
          className="px-4 py-2 text-sm text-mi-primary hover:bg-mi-light rounded-md transition-colors"
          disabled={messages.length === 0}
        >
          <Save className="h-4 w-4 mr-1" />
          Save Conversation
        </Button>
        <Button 
          variant="ghost"
          onClick={resetConversation}
          className="px-4 py-2 text-sm text-mi-dark hover:bg-mi-light rounded-md transition-colors"
        >
          New Conversation
        </Button>
      </div>
    </header>
  );
};

export default Header;
