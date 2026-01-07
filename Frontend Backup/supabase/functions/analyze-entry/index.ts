import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  content: string;
  isKindFriendMode: boolean;
}

interface AnalysisResponse {
  mood: string;
  reflection: string;
  suggestions: string[];
  colorHint: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { content, isKindFriendMode } = await req.json() as AnalyzeRequest;

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = isKindFriendMode
      ? `You are a wise, compassionate friend analyzing someone's journal entry from a third-person perspective. Provide:
- mood: detected emotional state (happy, calm, neutral, sad, anxious, or stressed)
- reflection: A caring reflection as if a kind friend is speaking about them (2-3 sentences). Use "they/them" pronouns and speak with warmth.
- suggestions: 3 actionable self-care suggestions
- colorHint: A calming color that matches the mood (e.g., "soft blue", "warm amber", "gentle lavender")`
      : `You are a compassionate mental wellness companion analyzing a journal entry. Provide:
- mood: detected emotional state (happy, calm, neutral, sad, anxious, or stressed)
- reflection: An empathetic, supportive reflection (2-3 sentences)
- suggestions: 3 actionable self-care suggestions
- colorHint: A calming color that matches the mood (e.g., "soft blue", "warm amber", "gentle lavender")`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "journal_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                mood: {
                  type: "string",
                  enum: ["happy", "calm", "neutral", "sad", "anxious", "stressed"],
                },
                reflection: { type: "string" },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
                colorHint: { type: "string" },
              },
              required: ["mood", "reflection", "suggestions", "colorHint"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to analyze entry" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysis: AnalysisResponse = JSON.parse(
      openaiData.choices[0].message.content
    );

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-entry:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});