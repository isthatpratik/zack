-- Add token_usage column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0;

-- Create token_usage_history table to track token usage over time
CREATE TABLE IF NOT EXISTS public.token_usage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    tokens_used INTEGER NOT NULL,
    model VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_type VARCHAR(255) NOT NULL
);

-- Enable row level security
ALTER TABLE public.token_usage_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own token usage history
DROP POLICY IF EXISTS "Users can view their own token usage history" ON public.token_usage_history;
CREATE POLICY "Users can view their own token usage history"
    ON public.token_usage_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own token usage history
DROP POLICY IF EXISTS "Users can insert their own token usage history" ON public.token_usage_history;
CREATE POLICY "Users can insert their own token usage history"
    ON public.token_usage_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add realtime support
alter publication supabase_realtime add table token_usage_history;