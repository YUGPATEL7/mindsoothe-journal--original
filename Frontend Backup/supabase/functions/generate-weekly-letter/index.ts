import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WeeklyLetterRequest {
  weekStart: string;
  weekEnd: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { weekStart, weekEnd } = await req.json() as WeeklyLetterRequest;

    const { data: entries, error: entriesError } = await supabase
      .from("journal_entries")
      .select("content, mood, reflection, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekStart)
      .lte("created_at", weekEnd)
      .order("created_at", { ascending: true });

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch entries" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: "No entries found for this week" }),
        {
          status: 404,
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

    const moodSummary = entries.reduce((acc: any, entry: any) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const entriesSummary = entries
      .map((e: any, i: number) => `Day ${i + 1}: ${e.mood} - ${e.reflection}`)
      .join("\n");

    const systemPrompt = `You are writing a compassionate letter from the user's future self, reflecting on their week of journaling. The letter should:
- Be warm, encouraging, and insightful
- Acknowledge their emotional journey
- Highlight growth and resilience
- Offer gentle wisdom
- Be 3-4 paragraphs
- Sign off as "Your Future Self" with a sparkle emoji`;

    const userPrompt = `This week I journaled ${entries.length} times. Here's my emotional journey:

Mood distribution: ${JSON.stringify(moodSummary)}

${entriesSummary}

Write a letter from my future self reflecting on this week.`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate letter" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const letterContent = openaiData.choices[0].message.content;

    const { data: letter, error: insertError } = await supabase
      .from("weekly_letters")
      .insert({
        user_id: user.id,
        content: letterContent,
        week_start: weekStart,
        week_end: weekEnd,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving letter:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save letter" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ letter }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-weekly-letter:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});