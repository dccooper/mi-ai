export const callOpenAI = async (prompt: string) => {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });
    return await response.json();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
} 