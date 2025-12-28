export const generateAIResponse = async (userMessage: string, context: string): Promise<string> => {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userMessage, context })
    });

    if (!res.ok) {
      console.error('Proxy returned error', await res.text());
      return "I encountered a temporary issue connecting to the intelligence center. Please try again.";
    }

    // Worker returns JSON in shape { text, raw }
    const data = await res.json();
    if (data && data.text) {
      return data.text;
    }

    // Fallbacks
    if (data && data.output) return data.output;
    if (typeof data === 'string') return data;

    return "I encountered a temporary issue connecting to the intelligence center. Please try again.";
  } catch (err) {
    console.error('Error calling proxy:', err);
    return "I encountered a temporary issue connecting to the intelligence center. Please try again.";
  }
};
