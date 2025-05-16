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
  isUpdating?: boolean;
  errorMessage?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  open, 
  onClose, 
  isUpdating = false,
  errorMessage 
}) => {
  const [apiKey, setApiKeyState] = useState(import.meta.env.VITE_OPENAI_API_KEY || "");
  const { addMessage } = useMI();

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key.");
      return;
    }

    // Save API key
    setApiKey(apiKey.trim());
    
    if (!isUpdating) {
      // Add welcome message only for initial setup
      addMessage({
        content: 
          "Hi there! I'm an AI assistant trained in Motivational Interviewing techniques. " +
          "I'm here to help you explore your thoughts about changing a behavior. " +
          "What behavior would you like to discuss today?",
        sender: "ai",
      });
    }
    
    toast.success("API key saved successfully!");
    onClose();
  };

  // If we have an environment variable API key, submit automatically
  React.useEffect(() => {
    if (import.meta.env.VITE_OPENAI_API_KEY && !isUpdating) {
      handleSubmit();
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-mi-primary">
            {isUpdating ? "Update API Key" : "API Key Required"}
          </DialogTitle>
          <DialogDescription>
            {errorMessage ? (
              <div className="mb-2 text-red-500">{errorMessage}</div>
            ) : null}
            
            {isUpdating ? 
              "Please enter a new OpenAI API key." :
              "To use this Motivational Interviewing tool, please enter your OpenAI API key."
            }
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
            {isUpdating ? "Update API Key" : "Save API Key"}
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
          <div className="mt-2 text-center text-xs text-mi-dark/60">
            If you're seeing quota errors, you may need to add billing information to your OpenAI account or create a new API key.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
