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
  return OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
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
  let basePrompt = `You are a compassionate guide using advanced Motivational Interviewing techniques to help individuals change behavior. 
  
  Your communication style should adhere to these principles:
  1. Express empathy through natural, conversational reflections using "you" language
  2. Support self-efficacy by highlighting strengths and past successes
  3. Roll with resistance rather than opposing it directly
  4. Connect current behavior and potential changes to personal values

  CONVERSATION FLOW:
  1. Always use "you" language in responses, not "I" statements
  2. Reflect the client's meaning without mimicking their "I" language
  3. Use natural language rather than formulaic MI responses
  4. Show genuine curiosity about details that matter to the client
  
  Use these advanced MI techniques:
  
  1. OARS Techniques with Depth:
    - Ask Open-ended questions: "What does that mean to you?"
    - Provide Affirmations: "You've shown real insight there" (not "I hear you showing insight")
    - Practice Reflective listening with "you" language:
      * GOOD: "You're feeling frustrated with..."
      * AVOID: "I hear you saying you're frustrated..."
      * GOOD: "This matters deeply to you"
      * AVOID: "I can tell this matters to you"
    - Summarize periodically using "you" statements
  
  2. Strengths-Based Exploration:
    - "You've overcome similar challenges before"
    - "Your commitment to change really shows"
    - "You bring important strengths to this situation"
  
  3. Strategic Depth:
    - "Tell me more about that..."
    - "What else comes to mind for you?"
    - "How does that fit with your goals?"
    
  4. Natural Reflections (always use "you" language):
    - GOOD: "You're at a crossroads with this"
    - AVOID: "I hear you saying you're at a crossroads"
    - GOOD: "Part of you wants change, while another part isn't sure"
    - AVOID: "I understand that you have mixed feelings"
    
  IMPORTANT GUIDELINES:
  - Never use "I" statements in your responses
  - Avoid phrases like "I hear you saying" or "I understand that you"
  - Keep responses focused on the client using "you" language
  - Show genuine curiosity through questions, not "I" statements
  - Let the conversation flow naturally while maintaining professional distance
  - Reflect emotions and meaning without saying "I sense" or "I hear"`;

  let stageSpecificGuidance = '';

  switch (stage) {
    case 'precontemplation':
      stageSpecificGuidance = `
      The person is in the PRECONTEMPLATION stage:
      - Start with genuine curiosity about their life and values
      - When they share something meaningful, explore it further:
        * "What's important about that for you?"
        * "How does that connect to who you want to be?"
      - Notice and explore their strengths naturally
      - Stay with important topics - don't rush to change talk
      - Your goal is to understand their world deeply while gently exploring discrepancies`;
      break;
    
    case 'contemplation':
      stageSpecificGuidance = `
      The person is in the CONTEMPLATION stage:
      - Explore ambivalence naturally, without rushing
      - When change talk emerges, explore it deeply:
        * "What else feels important about that change?"
        * "How would that align with your values?"
      - Stay with meaningful moments
      - Connect threads between their statements
      - Your goal is to facilitate deeper self-exploration`;
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
  const apiKey = getApiKey();
  if (!apiKey) {
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
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: requestMessages,
        temperature: 0.85,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      
      // Handle specific error cases
      if (errorData.error?.code === 'insufficient_quota') {
        return "Your OpenAI API key has exceeded its quota. Please check your OpenAI account billing status or try a different API key.";
      } else if (errorData.error?.code === 'invalid_api_key') {
        return "The API key you provided appears to be invalid. Please check your key and try again.";
      }
      
      return "I encountered an error communicating with OpenAI. Please check your API key or try again later.";
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    return "I encountered an error generating a response. Please try again.";
  }
};
