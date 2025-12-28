export default {
  async fetch(request: Request, env: any) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/generate')) {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    try {
      const payload = await request.json();
      const { userMessage = '', context = '' } = payload;

      // Basic validation
      if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured in Worker environment' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // Prepare a system instruction and combined prompt. Adjust as needed for your desired behavior.
      const systemInstruction = `You are the TrustBnB AI Assistant. Your tone is Professional, Calm, Reliable, and Discreet. Keep answers concise.`;
      const promptText = `${systemInstruction}\n\nContext:\n${context}\n\nUser:\n${userMessage}`;

      // Choose model (can be overridden via env.MODEL)
      const model = env.MODEL || 'gemini-2.5-flash';

      // Construct a Gemini REST-style payload. Many GenAI endpoints accept a `prompt` with `text` or `input` — include both to maximize compatibility.
      const body = {
        // model endpoint includes model in the URL, but include here for clarity if needed
        model,
        // Common shapes: `prompt: { text: ... }` or `input: '...'`
        prompt: { text: promptText },
        input: promptText,
        temperature: 0.2,
        maxOutputTokens: 512
      };

      const EXTERNAL_API_URL = env.EXTERNAL_API_URL || `https://api.generative.google/v1/models/${model}:generateText`;

      const externalRes = await fetch(EXTERNAL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const contentType = externalRes.headers.get('content-type') || '';
      let responseBody: any = null;

      if (contentType.includes('application/json')) {
        responseBody = await externalRes.json();
      } else {
        // Some endpoints may return plain text
        const rawText = await externalRes.text();
        responseBody = { text: rawText };
      }

      // Attempt to extract text from common generative response shapes
      const extractText = (data: any) => {
        if (!data) return null;
        // Google GenAI new formats
        if (data?.candidates && data.candidates[0]) return data.candidates[0].output || data.candidates[0].content || data.candidates[0].text;
        if (data?.outputs && data.outputs[0]) {
          // outputs[0].content is an array of content blocks
          const first = data.outputs[0];
          if (first?.content) {
            // Find any text content
            for (const c of first.content) {
              if (typeof c === 'string') return c;
              if (c?.type === 'output_text' && c?.text) return c.text;
              if (c?.text) return c.text;
            }
          }
        }
        if (data?.text) return data.text;
        if (data?.output) return data.output;
        // Fallback: stringify
        return JSON.stringify(data);
      };

      const extracted = extractText(responseBody);

      const result = { text: extracted || '', raw: responseBody };

      return new Response(JSON.stringify(result), { status: externalRes.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
};
