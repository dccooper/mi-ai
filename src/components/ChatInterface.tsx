
import React, { useState, useRef, useEffect } from "react";
import { useMI } from "../context/MIContext";
import MessageBubble from "./MessageBubble";
import AssessmentModal from "./AssessmentModal";
import ApiKeyModal from "./ApiKeyModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Key } from "lucide-react";
import { generateResponse, getApiKey } from "../services/openaiService";
import { toast } from "sonner";

const ChatInterface: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [showAssessment, setShowAssessment] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(!getApiKey());
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isUpdatingApiKey, setIsUpdatingApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    state: { 
      messages, 
      currentStage, 
      targetBehavior, 
      isThinking,
      isFinalSummary
    }, 
    addMessage, 
    setThinking, 
    setTargetBehavior,
    saveConversation
  } = useMI();

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send welcome message when chat starts
  useEffect(() => {
    if (messages.length === 0 && getApiKey()) {
      handleAIResponse(
        "Hi there! I'm an AI assistant trained in Motivational Interviewing techniques. " +
        "I'm here to help you explore your thoughts about changing a behavior. " +
        "What behavior would you like to discuss today?"
      );
    }
  }, [messages.length]);

  // Open API key modal
  const handleOpenApiKeyModal = (isUpdating = false, errorMsg = null) => {
    setIsUpdatingApiKey(isUpdating);
    setApiKeyError(errorMsg);
    setShowApiKeyModal(true);
  };

  // Send a message and get AI response
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    if (!getApiKey()) {
      handleOpenApiKeyModal(false);
      return;
    }

    // Add user message
    addMessage({
      content: userInput,
      sender: "user",
    });

    // Clear input
    setUserInput("");

    // If this is the first message, it might contain the target behavior
    if (!targetBehavior) {
      setTargetBehavior(userInput);
      
      // Ask for assessment after identifying target behavior
      setTimeout(() => {
        setShowAssessment(true);
      }, 1000);
    }

    // Get AI response
    await getAIResponse();
  };

  // Handle AI response generation
  const getAIResponse = async () => {
    setThinking(true);
    try {
      const response = await generateResponse(
        [...messages, { id: 'temp', content: userInput, sender: 'user', timestamp: new Date() }],
        currentStage,
        targetBehavior
      );
      
      // Check if the response contains API key errors
      if (response.includes("exceeded its quota") || response.includes("API key")) {
        setApiKeyError(response);
        handleOpenApiKeyModal(true, response);
      } else {
        handleAIResponse(response);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get a response. Please try again.");
    }
    setThinking(false);
  };

  // Add AI message to the conversation
  const handleAIResponse = (content: string) => {
    addMessage({
      content,
      sender: "ai",
    });
  };

  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
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

      {/* Input area */}
      <div className="p-4 border-t border-mi-light bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between mb-4">
            {isFinalSummary && (
              <Button 
                onClick={saveConversation}
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
              onClick={() => handleOpenApiKeyModal(true)}
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

      {/* Modals */}
      {targetBehavior && (
        <AssessmentModal
          open={showAssessment}
          onClose={() => setShowAssessment(false)}
          targetBehavior={targetBehavior}
        />
      )}
      
      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        isUpdating={isUpdatingApiKey}
        errorMessage={apiKeyError || undefined}
      />
    </div>
  );
};

export default ChatInterface;
