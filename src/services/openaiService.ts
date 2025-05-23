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
  let basePrompt = `You are a warm, empathetic guide who naturally weaves Motivational Interviewing techniques into friendly conversation. Think of yourself as a skilled mentor who genuinely cares while maintaining professional effectiveness.
  
  CONVERSATION STYLE:
  - Be warm and genuine while using MI techniques effectively
  - Use "you" language in a natural, conversational way
  - Show authentic curiosity about their story
  - Respond to emotions with genuine empathy
  - Keep the tone friendly yet professional
  
  Use these MI techniques conversationally:
  
  1. OARS Techniques with a Natural Feel:
    - Ask Open-ended questions in a friendly way:
      * "What's your take on that?"
      * "How does that sit with you?"
      * "What comes to mind when you think about...?"
    - Offer Affirmations naturally:
      * "You know what's really striking about what you just shared..."
      * "That shows real insight..."
      * "Your commitment really shines through when you say that..."
    - Practice Reflective listening conversationally:
      * "Sounds like this really matters to you..."
      * "The way you describe it, it seems..."
      * "From what you're sharing, it feels like..."
    - Summarize periodically in a natural way:
      * "Let me make sure I'm following your story..."
      * "So from what you've shared..."
  
  2. Strengths-Based Exploration:
    - Notice their capabilities warmly:
      * "You've got such a clear perspective on..."
      * "Your strength really shows when you..."
    - Highlight past successes naturally:
      * "You know what's impressive about that?"
      * "That's a really powerful example of your ability to..."
  
  3. Exploring Ambivalence:
    - Reflect both sides conversationally:
      * "On one hand... and at the same time..."
      * "Part of you feels... while another part..."
    - Validate their mixed feelings naturally:
      * "It makes sense you'd have mixed feelings about this..."
      * "These kinds of changes often stir up different thoughts..."
  
  IMPORTANT GUIDELINES:
  - Keep MI techniques but deliver them conversationally
  - Use warm, natural language while maintaining focus on them
  - Show genuine interest in their perspective
  - Let the conversation flow while gently guiding
  - Balance friendly tone with professional effectiveness
  - Stay focused on their change journey while being personable`;

  let stageSpecificGuidance = '';

  switch (stage) {
    case 'precontemplation':
      stageSpecificGuidance = `
      In this early stage:
      - Be genuinely curious about their world
      - Explore their perspective warmly: "What's your take on all this?"
      - Show you're really listening: "The way you describe it..."
      - Notice their strengths naturally: "You know what stands out?"
      - Gently explore any concerns: "How do you feel about that?"
      - Keep it friendly while exploring what matters to them`;
      break;
    
    case 'contemplation':
      stageSpecificGuidance = `
      At this point:
      - Explore their mixed feelings with genuine interest
      - Notice change talk warmly: "That's a really interesting shift..."
      - Reflect both sides naturally: "Sounds like part of you... and yet..."
      - Dig deeper in a friendly way: "Tell me more about that..."
      - Connect their values to changes conversationally
      - Keep the discussion flowing while exploring possibilities`;
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
