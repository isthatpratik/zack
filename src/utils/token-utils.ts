import { createClient } from "../../supabase/client";

/**
 * Estimates the number of tokens in a text string
 * This is a simple estimation - in production, you would use a proper tokenizer
 * @param text The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Checks if a user has enough tokens remaining in their free tier
 * @param userId The user's ID
 * @returns Boolean indicating if user has tokens remaining
 */
export async function checkTokenAvailability(userId: string): Promise<{
  hasTokens: boolean;
  tokensUsed: number;
  tokenLimit: number;
  remaining: number;
}> {
  const supabase = createClient();
  const tokenLimit = 5000; // Free tier limit

  // Get user's token usage
  const { data, error } = await supabase
    .from("users")
    .select("token_usage")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error checking token availability:", error);
    return { hasTokens: false, tokensUsed: 0, tokenLimit, remaining: 0 };
  }

  const tokensUsed = data?.token_usage || 0;
  const remaining = tokenLimit - tokensUsed;

  return {
    hasTokens: remaining > 0,
    tokensUsed,
    tokenLimit,
    remaining,
  };
}

/**
 * Records token usage for a user
 * @param userId The user's ID
 * @param tokensUsed Number of tokens used
 * @param model The AI model used
 * @param requestType The type of request (chat, completion, etc.)
 */
export async function recordTokenUsage(
  userId: string,
  tokensUsed: number,
  model: string,
  requestType: string,
): Promise<void> {
  const supabase = createClient();

  // Update user's total token usage
  const { error: updateError } = await supabase
    .from("users")
    .update({
      token_usage: supabase.rpc("increment", {
        row_id: userId,
        increment_amount: tokensUsed,
      }),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating token usage:", updateError);
  }

  // Record token usage history
  const { error: historyError } = await supabase
    .from("token_usage_history")
    .insert({
      user_id: userId,
      tokens_used: tokensUsed,
      model,
      request_type: requestType,
    });

  if (historyError) {
    console.error("Error recording token usage history:", historyError);
  }
}
