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

    // Set target behavior only on first message
    if (!targetBehavior) {
      setTargetBehavior(userInput);
    }

    // More specific readiness signals that indicate commitment to change
    const strongReadinessSignals = [
      "i want to change", "i need to change", 
      "i'm ready to", "i have to change",
      "i'm going to", "i will", "i must",
      "i've decided to", "it's time to"
    ];

    const moderateReadinessSignals = [
      "i might", "i could", "thinking about", 
      "considering", "maybe i should",
      "i want to", "i'd like to"
    ];

    // Count how many messages show readiness
    const messageHistory = [...messages, { content: userInput, sender: 'user' }];
    const readinessCount = messageHistory.filter(msg => 
      msg.sender === 'user' && (
        strongReadinessSignals.some(signal => 
          msg.content.toLowerCase().includes(signal.toLowerCase())
        ) ||
        moderateReadinessSignals.some(signal => 
          msg.content.toLowerCase().includes(signal.toLowerCase())
        )
      )
    ).length;

    // Only show assessment after multiple signs of readiness
    const hasStrongSignal = strongReadinessSignals.some(signal => 
      userInput.toLowerCase().includes(signal.toLowerCase())
    );

    const hasModerateSignal = moderateReadinessSignals.some(signal => 
      userInput.toLowerCase().includes(signal.toLowerCase())
    );

    // Show assessment if:
    // 1. We have a strong readiness signal OR
    // 2. We have at least 2 moderate signals across the conversation
    if (!showAssessment && (hasStrongSignal || (hasModerateSignal && readinessCount >= 2))) {
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
