import { useState, useEffect } from "react";
import { useMI } from "../context/MIContext";
import { generateResponse, getApiKey } from "../services/openaiService";
import { toast } from "sonner";

export const useChatLogic = () => {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(
    !getApiKey() && !import.meta.env.VITE_OPENAI_API_KEY
  );
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isUpdatingApiKey, setIsUpdatingApiKey] = useState(false);
  
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

  // Send welcome message when chat starts
  useEffect(() => {
    if (messages.length === 0 && (getApiKey() || import.meta.env.VITE_OPENAI_API_KEY)) {
      handleAIResponse(
        "Hi there! I'm an AI assistant trained in Motivational Interviewing techniques. " +
        "I'm here to help you explore your thoughts about changing a behavior. " +
        "What behavior would you like to discuss today?"
      );
    }
  }, [messages.length]);

  // Handle API key modal
  const handleOpenApiKeyModal = (isUpdating = false, errorMsg = null) => {
    setIsUpdatingApiKey(isUpdating);
    setApiKeyError(errorMsg);
    setShowApiKeyModal(true);
  };

  // Handle AI response
  const handleAIResponse = (content: string) => {
    addMessage({
      content,
      sender: "ai",
    });
  };

  // Get AI response
  const getAIResponse = async () => {
    setThinking(true);
    try {
      const response = await generateResponse(
        messages,
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

  // Send message
  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
      handleOpenApiKeyModal(false);
      return;
    }

    // Add user message
    addMessage({
      content: userInput,
      sender: "user",
    });

    // If this is the first message, set target behavior but don't show assessment yet
    if (!targetBehavior) {
      setTargetBehavior(userInput);
    }

    // Check for readiness signals in the conversation
    const readinessSignals = [
      "i might", "i could", "thinking about", "considering",
      "maybe i should", "i want to", "i'd like to",
      "i need to", "i have to", "planning to"
    ];

    const hasReadinessSignals = readinessSignals.some(signal => 
      userInput.toLowerCase().includes(signal.toLowerCase())
    );

    // Show assessment only when readiness signals are detected
    if (hasReadinessSignals && !showAssessment) {
      setTimeout(() => {
        setShowAssessment(true);
      }, 1000);
    }

    // Get AI response
    await getAIResponse();
  };

  return {
    messages,
    isThinking,
    isFinalSummary,
    targetBehavior,
    showAssessment,
    showApiKeyModal,
    apiKeyError,
    isUpdatingApiKey,
    handleSendMessage,
    handleOpenApiKeyModal,
    setShowAssessment,
    setShowApiKeyModal,
    saveConversation
  };
};
