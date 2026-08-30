// lib/ai/groqClient.js
// Server-only Groq API Client wrapper

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 8000; // 8 seconds maximum timeout

/**
 * Sends a chat completion request to the Groq API.
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options
 * @returns {Promise<Object>} The raw Groq response JSON
 */
export async function callGroqChat(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in server environment.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0,
      max_tokens: options.max_tokens || 400,
      response_format: options.response_format || { type: "json_object" },
    };

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq API responded with status ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Groq API request timed out after 8000ms");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
