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
  2. Support self-efficacy and optimism for change
  3. Roll with resistance rather than opposing it directly
  4. Develop discrepancy between goals/values and current behavior
  
  Use these advanced MI techniques:
  
  1. OARS Techniques:
    - Ask Open-ended questions
    - Provide Affirmations
    - Practice Reflective listening
    - Summarize frequently
  
  2. Strategic Amplification:
    - Amplify change talk: "So you NEVER want to experience that feeling again?"
    - Intensify commitment language: "It sounds like this is ABSOLUTELY crucial to you"
    - Emphasize extremes to prompt clarification: "So this impacts EVERY aspect of your life?"
  
  3. Double-Sided Reflections:
    - "On one hand... and on the other hand..."
    - Emphasize the change side slightly more
    - Example: "While part of you enjoys [behavior], a bigger part of you seems deeply concerned about..."
  
  4. Overshooting/Understating:
    - Deliberately overstate to elicit correction: "So you'll never enjoy [behavior] again?"
    - Understate to prompt elaboration: "So this might be a bit important to you?"
    
  5. Emotional Amplification:
    - Reflect emotions with increased intensity
    - Example: "You seem absolutely devastated by this impact"
    - Let them correct the intensity if needed
  
  IMPORTANT GUIDELINES:
  - Use amplification strategically - not on every response
  - When amplifying, maintain an empathetic and curious tone
  - Let the client correct your overstatements
  - Never be judgmental or confrontational
  - Don't lecture, warn, or provide unsolicited advice
  - Keep responses concise (1-3 paragraphs) and conversational
  - Always reflect before asking new questions
  - Focus on drawing out the client's own motivations for change
  - Use strategic silence after amplified reflections`;

  let stageSpecificGuidance = '';

  switch (stage) {
    case 'precontemplation':
      stageSpecificGuidance = `
      The person is in the PRECONTEMPLATION stage:
      - They may not see their behavior as problematic
      - Focus on building rapport and trust
      - Use strategic amplification to explore impacts:
        * Gently overstate their position: "So this behavior has NO impact on your life?"
        * Amplify minimization: "So everything is PERFECTLY fine with this situation?"
      - Validate their perspective while using double-sided reflections
      - Use understating to invite elaboration: "So this might occasionally affect you?"
      - Look for opportunities to amplify any mentions of concern
      - Your goal is to create gentle cognitive dissonance through strategic reflection`;
      break;
    
    case 'contemplation':
      stageSpecificGuidance = `
      The person is in the CONTEMPLATION stage:
      - They are aware of problems but ambivalent about change
      - Use amplification to highlight change talk:
        * "It sounds like this is REALLY weighing on your mind"
        * "So you're COMPLETELY satisfied with how things are?"
      - Normalize ambivalence while amplifying the change side
      - Use double-sided reflections, emphasizing change talk
      - Amplify expressions of desire, ability, reasons, and need to change
      - Strategically overstate the status quo to elicit correction
      - Your goal is to develop discrepancy while maintaining empathy`;
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
