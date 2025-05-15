
import React from "react";
import MessageList from "./chat/MessageList";
import MessageInput from "./chat/MessageInput";
import AssessmentModal from "./AssessmentModal";
import ApiKeyModal from "./ApiKeyModal";
import { useChatLogic } from "../hooks/useChatLogic";

const ChatInterface: React.FC = () => {
  const {
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
  } = useChatLogic();

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
      <MessageList 
        messages={messages} 
        isThinking={isThinking} 
      />

      {/* Input area */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
        isFinalSummary={isFinalSummary}
        onSaveConversation={saveConversation}
        onUpdateApiKey={() => handleOpenApiKeyModal(true)}
      />

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
