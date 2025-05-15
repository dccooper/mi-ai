
import React, { createContext, useContext, useState, useReducer } from 'react';
import { Stage, Message, Assessment, ConversationState } from '../types/mi-types';
import { v4 as uuidv4 } from 'uuid';

// Action types
type ActionType = 
  | { type: 'ADD_MESSAGE'; payload: Omit<Message, 'id' | 'timestamp'> }
  | { type: 'SET_STAGE'; payload: Stage }
  | { type: 'SET_TARGET_BEHAVIOR'; payload: string }
  | { type: 'SET_ASSESSMENT'; payload: Assessment }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_FINAL_SUMMARY'; payload: boolean }
  | { type: 'RESET_CONVERSATION' };

// Initial state
const initialState: ConversationState = {
  messages: [],
  currentStage: 'precontemplation',
  targetBehavior: null,
  assessment: null,
  isThinking: false,
  isFinalSummary: false,
};

// Reducer function
function miReducer(state: ConversationState, action: ActionType): ConversationState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            content: action.payload.content,
            sender: action.payload.sender,
            timestamp: new Date(),
          },
        ],
      };
    case 'SET_STAGE':
      return {
        ...state,
        currentStage: action.payload,
      };
    case 'SET_TARGET_BEHAVIOR':
      return {
        ...state,
        targetBehavior: action.payload,
      };
    case 'SET_ASSESSMENT':
      return {
        ...state,
        assessment: action.payload,
      };
    case 'SET_THINKING':
      return {
        ...state,
        isThinking: action.payload,
      };
    case 'SET_FINAL_SUMMARY':
      return {
        ...state,
        isFinalSummary: action.payload,
      };
    case 'RESET_CONVERSATION':
      return initialState;
    default:
      return state;
  }
}

// Context
interface MIContextType {
  state: ConversationState;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setStage: (stage: Stage) => void;
  setTargetBehavior: (behavior: string) => void;
  setAssessment: (assessment: Assessment) => void;
  setThinking: (isThinking: boolean) => void;
  setFinalSummary: (isFinal: boolean) => void;
  resetConversation: () => void;
  saveConversation: () => void;
}

const MIContext = createContext<MIContextType | undefined>(undefined);

export const MIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(miReducer, initialState);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const setStage = (stage: Stage) => {
    dispatch({ type: 'SET_STAGE', payload: stage });
  };

  const setTargetBehavior = (behavior: string) => {
    dispatch({ type: 'SET_TARGET_BEHAVIOR', payload: behavior });
  };

  const setAssessment = (assessment: Assessment) => {
    dispatch({ type: 'SET_ASSESSMENT', payload: assessment });
  };

  const setThinking = (isThinking: boolean) => {
    dispatch({ type: 'SET_THINKING', payload: isThinking });
  };

  const setFinalSummary = (isFinal: boolean) => {
    dispatch({ type: 'SET_FINAL_SUMMARY', payload: isFinal });
  };

  const resetConversation = () => {
    dispatch({ type: 'RESET_CONVERSATION' });
  };

  // Function to save conversation
  const saveConversation = () => {
    const conversationData = state.messages.map(msg => ({
      role: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));

    // Create a JSON string with formatting
    const jsonData = JSON.stringify(
      {
        conversation: conversationData,
        targetBehavior: state.targetBehavior,
        stage: state.currentStage,
        assessment: state.assessment,
        date: new Date().toISOString(),
      },
      null,
      2
    );

    // Create a Blob with the data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mi-conversation-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const value = {
    state,
    addMessage,
    setStage,
    setTargetBehavior,
    setAssessment,
    setThinking,
    setFinalSummary,
    resetConversation,
    saveConversation,
  };

  return <MIContext.Provider value={value}>{children}</MIContext.Provider>;
};

export const useMI = () => {
  const context = useContext(MIContext);
  if (context === undefined) {
    throw new Error('useMI must be used within a MIProvider');
  }
  return context;
};
