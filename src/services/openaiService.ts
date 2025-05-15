
import { Stage, Message } from '../types/mi-types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// This is a placeholder API key - in a production app, this should be handled securely
// For this demo, users will be asked to input their own OpenAI API key
let OPENAI_API_KEY: string | null = null;

export const setApiKey = (key: string): void => {
  OPENAI_API_KEY = key;
};

export const getApiKey = (): string | null => {
  return OPENAI_API_KEY;
};

// Helper to convert our Message type to OpenAI message format
const convertToOpenAIMessages = (messages: Message[]): OpenAIMessage[] => {
  return messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
};

// Create system message based on the current stage
const createSystemMessage = (
  stage: Stage,
  targetBehavior: string | null
): OpenAIMessage => {
  let basePrompt = `You are a compassionate guide using Motivational Interviewing techniques to help individuals change behavior. 
  
  Your communication style should adhere to these principles:
  1. Express empathy through reflective listening
  2. Support self-efficacy and optimism for change
  3. Roll with resistance rather than opposing it directly
  4. Develop discrepancy between goals/values and current behavior
  
  Use the OARS techniques:
  - Ask Open-ended questions
  - Provide Affirmations
  - Practice Reflective listening
  - Summarize frequently
  
  IMPORTANT GUIDELINES:
  - Never be judgmental or confrontational
  - Don't lecture, warn, or provide unsolicited advice
  - Avoid arguing, disagreeing, or blaming
  - Don't rush the process - change takes time
  - Be patient, warm, and genuinely interested
  - Keep responses concise (1-3 paragraphs) and conversational
  - Always reflect on user statements before asking new questions
  - Focus on drawing out the user's own motivations for change`;

  let stageSpecificGuidance = '';

  switch (stage) {
    case 'precontemplation':
      stageSpecificGuidance = `
      The person is in the PRECONTEMPLATION stage:
      - They may not see their behavior as problematic
      - Focus on building rapport and trust
      - Raise gentle awareness about potential concerns
      - Validate their perspective even if you disagree
      - Ask permission before providing information
      - Help them explore potential impact of their behavior
      - Look for small openings to discuss change
      - Your goal is not to convince but to start reflection`;
      break;
    
    case 'contemplation':
      stageSpecificGuidance = `
      The person is in the CONTEMPLATION stage:
      - They are aware of problems but ambivalent about change
      - Normalize ambivalence and acknowledge both sides
      - Help explore pros and cons of both changing and not changing
      - Explore values and how current behavior aligns or conflicts
      - Emphasize personal choice and control
      - Support exploration of their reasons, desires, and ability to change
      - Elicit "change talk" - statements supporting desire for change
      - Your goal is to tip the balance toward change without pushing`;
      break;
    
    case 'preparation':
      stageSpecificGuidance = `
      The person is in the PREPARATION stage:
      - They are committed to change and planning specific actions
      - Help clarify realistic, achievable goals
      - Develop a specific action plan with concrete steps
      - Explore potential barriers and problem-solve solutions
      - Identify sources of support and resources
      - Boost confidence in their ability to implement the plan
      - Your goal is to help them develop a clear, workable plan`;
      break;
    
    case 'action':
      stageSpecificGuidance = `
      The person is in the ACTION stage:
      - They are actively making changes
      - Provide encouragement and positive reinforcement
      - Help troubleshoot challenges as they arise
      - Normalize setbacks as opportunities for learning
      - Refine strategies based on what's working
      - Continue to reinforce commitment and motivation
      - Your goal is to support implementation and adjustment of their plan`;
      break;
    
    case 'maintenance':
      stageSpecificGuidance = `
      The person is in the MAINTENANCE stage:
      - They have made significant changes and are working to sustain them
      - Focus on strategies to maintain long-term change
      - Identify high-risk situations and develop coping plans
      - Reinforce new behaviors and identity changes
      - Prepare for potential relapse scenarios
      - Your goal is to help solidify the changes into a lasting lifestyle`;
      break;
  }

  let behaviorPrompt = '';
  if (targetBehavior) {
    behaviorPrompt = `\n\nThe target behavior they're working on is: ${targetBehavior}`;
  }

  return {
    role: 'system',
    content: basePrompt + stageSpecificGuidance + behaviorPrompt,
  };
};

// Function to generate responses from OpenAI
export const generateResponse = async (
  messages: Message[],
  stage: Stage,
  targetBehavior: string | null
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return "I need an OpenAI API key to continue our conversation. Please enter your API key.";
  }

  try {
    const systemMessage = createSystemMessage(stage, targetBehavior);
    const conversationHistory = convertToOpenAIMessages(messages);
    
    // Combine system message with conversation history
    const requestMessages = [systemMessage, ...conversationHistory];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: requestMessages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return "I encountered an error communicating with OpenAI. Please check your API key or try again later.";
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    return "I encountered an error generating a response. Please try again.";
  }
};
