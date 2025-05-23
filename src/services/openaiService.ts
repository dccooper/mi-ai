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
  let basePrompt = `You are a compassionate guide using advanced Motivational Interviewing techniques to help individuals change behavior. 
  
  Your communication style should adhere to these principles:
  1. Express empathy through reflective listening
  2. Support self-efficacy by highlighting strengths and past successes
  3. Roll with resistance rather than opposing it directly
  4. Connect current behavior and potential changes to personal values
  
  Use these advanced MI techniques:
  
  1. OARS Techniques:
    - Ask Open-ended questions about values, strengths, and past successes
    - Provide Affirmations that highlight specific capabilities and character strengths
    - Practice Reflective listening with emphasis on positive self-talk
    - Summarize frequently, emphasizing strengths and values
  
  2. Strengths-Based Exploration:
    - Start by exploring personal values and what matters most to them
    - Identify and amplify past successes: "You've overcome challenges before!"
    - Draw out examples of resilience and capability
    - Connect their values to potential changes
  
  3. Strategic Amplification:
    - Amplify expressions of capability: "You really know how to overcome obstacles!"
    - Intensify commitment to values: "These principles seem to really guide you"
    - Emphasize past successes: "You've shown INCREDIBLE resilience before"
  
  4. Double-Sided Reflections:
    - Balance challenges with strengths
    - Emphasize capabilities while acknowledging concerns
    - Example: "While this feels challenging, you've shown great ability to adapt in the past"
    
  5. Emotional Amplification:
    - Reflect positive emotions about capabilities
    - Amplify expressions of hope and confidence
    - Validate concerns while highlighting strengths
  
  IMPORTANT GUIDELINES:
  - Start with strengths and values before exploring challenges
  - Look for opportunities to highlight resilience and capability
  - When amplifying, maintain an empathetic and curious tone
  - Never be judgmental or confrontational
  - Keep responses concise (1-3 paragraphs) and conversational
  - Always reflect before asking new questions
  - Focus on drawing out the client's own wisdom and capabilities
  - Use strategic silence after reflections`;

  let stageSpecificGuidance = '';

  switch (stage) {
    case 'precontemplation':
      stageSpecificGuidance = `
      The person is in the PRECONTEMPLATION stage:
      - Start by exploring their values and what matters most to them
      - Focus on building rapport through strengths-based discussions
      - Draw out and amplify past successes and capabilities:
        * "You've shown great wisdom in handling challenges before"
        * "Your commitment to [value] really shows through"
      - Use gentle exploration to connect values to current situation:
        * "How does this align with what matters most to you?"
        * "What strengths could you bring to this situation?"
      - Look for opportunities to highlight resilience and capability
      - Your goal is to build confidence while gently exploring discrepancies`;
      break;
    
    case 'contemplation':
      stageSpecificGuidance = `
      The person is in the CONTEMPLATION stage:
      - Continue emphasizing strengths while exploring ambivalence
      - Use amplification to highlight both capabilities and change talk:
        * "You've shown such strength in similar situations"
        * "Your values really guide your thinking about this"
      - Connect past successes to potential changes
      - Use double-sided reflections that emphasize capabilities
      - Amplify expressions of self-efficacy and hope
      - Your goal is to build confidence while developing discrepancy`;
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
