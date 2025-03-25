import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/client";
import { estimateTokens, recordTokenUsage } from "../../../utils/token-utils";

export async function POST(request: NextRequest) {
  try {
    const { message, model, submodel, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Get user from supabase auth
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine which API to use based on the model
    let responseContent = "";
    let apiKey = "";
    let apiUrl = "";
    let requestBody: any = {};
    let headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Estimate tokens for this message
    const estimatedTokens = estimateTokens(message, model);

    // Select API based on model
    switch (model) {
      case "openai":
        apiKey = process.env.OPENAI_API_KEY || "";
        apiUrl = "https://api.openai.com/v1/chat/completions";

        // Map submodel to actual OpenAI model ID
        let openaiModel = "gpt-3.5-turbo";
        if (submodel === "GPT-4") openaiModel = "gpt-4";
        if (submodel === "GPT-4o") openaiModel = "gpt-4o";

        requestBody = {
          model: openaiModel,
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
        };
        headers["Authorization"] = `Bearer ${apiKey}`;
        break;

      case "claude":
        apiKey = process.env.CLAUDE_API_KEY || "";
        apiUrl = "https://api.anthropic.com/v1/messages";

        // Map submodel to actual Claude model ID
        let claudeModel = "claude-3-haiku-20240307";
        if (submodel === "Claude Opus") claudeModel = "claude-3-opus-20240229";
        if (submodel === "Claude Sonnet")
          claudeModel = "claude-3-sonnet-20240229";

        requestBody = {
          model: claudeModel,
          messages: [{ role: "user", content: message }],
          max_tokens: 1000,
        };
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
        break;

      case "gemini":
        apiKey = process.env.GEMINI_API_KEY || "";
        apiUrl =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

        // Gemini API structure
        requestBody = {
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        };

        // Add API key as query parameter
        apiUrl = `${apiUrl}?key=${apiKey}`;
        break;

      default:
        return NextResponse.json(
          { error: `Model ${model} is not supported yet` },
          { status: 400 },
        );
    }

    // Check if API key is available
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key for ${model} is not configured` },
        { status: 500 },
      );
    }

    // Call the API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: `Error from ${model} API: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Extract the response content based on the model
    switch (model) {
      case "openai":
        responseContent = data.choices[0]?.message?.content || "";
        break;
      case "claude":
        responseContent = data.content[0]?.text || "";
        break;
      case "gemini":
        responseContent = data.candidates[0]?.content?.parts[0]?.text || "";
        break;
      default:
        responseContent = "No response from model";
    }

    // Calculate response tokens
    const responseTokens = estimateTokens(responseContent, model);
    const totalTokens = estimatedTokens + responseTokens;

    // Record token usage
    await recordTokenUsage(
      userData.user.id,
      totalTokens,
      `${model}-${submodel}`,
      "chat",
    );

    return NextResponse.json({
      content: responseContent,
      tokens: totalTokens,
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
