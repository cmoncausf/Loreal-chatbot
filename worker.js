// Cloudflare Worker for L'Oréal-focused web search
// Replace 'YOUR_SEARCH_API_KEY' and 'YOUR_SEARCH_API_ENDPOINT' with your actual API credentials
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle GET requests (e.g., browser visit)
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ message: "L'Oreal chatbot is running" }), { headers: corsHeaders });
    }

    // Handle POST requests (from your app)
    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const userInput = await request.json();

    const requestBody = {
      model: 'gpt-4o',
      messages: userInput.messages,
      max_tokens: 800,
      temperature: 0.5,
      frequency_penalty: 0.8,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    } catch (err) {
      // Return error message to frontend
      return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
    }
  }
};
