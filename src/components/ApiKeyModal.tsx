
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setApiKey } from "../services/openaiService";
import { useMI } from "../context/MIContext";
import { toast } from "sonner";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onClose }) => {
  const [apiKey, setApiKeyState] = useState("");
  const { addMessage } = useMI();

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key.");
      return;
    }

    // Save API key
    setApiKey(apiKey.trim());
    
    // Add welcome message
    addMessage({
      content: 
        "Hi there! I'm an AI assistant trained in Motivational Interviewing techniques. " +
        "I'm here to help you explore your thoughts about changing a behavior. " +
        "What behavior would you like to discuss today?",
      sender: "ai",
    });
    
    toast.success("API key saved successfully!");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-mi-primary">API Key Required</DialogTitle>
          <DialogDescription>
            To use this Motivational Interviewing tool, please enter your OpenAI API key.
            <br /><br />
            Your key is only stored in your browser session and is not saved on any server.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder="sk-..."
            className="mb-4"
          />
          <Button 
            className="w-full bg-mi-primary hover:bg-mi-primary/80 text-white" 
            onClick={handleSubmit}
          >
            Save API Key
          </Button>
          <div className="mt-4 text-center text-xs text-mi-dark/60">
            Don't have an OpenAI API key? 
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-mi-primary ml-1"
            >
              Get one here
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
