
-- User settings table for notification/privacy preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  private_account BOOLEAN NOT NULL DEFAULT false,
  notify_likes BOOLEAN NOT NULL DEFAULT true,
  notify_comments BOOLEAN NOT NULL DEFAULT true,
  notify_follows BOOLEAN NOT NULL DEFAULT true,
  notify_messages BOOLEAN NOT NULL DEFAULT true,
  who_can_comment TEXT NOT NULL DEFAULT 'everyone',
  who_can_message TEXT NOT NULL DEFAULT 'everyone',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for stories (for live ring updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
