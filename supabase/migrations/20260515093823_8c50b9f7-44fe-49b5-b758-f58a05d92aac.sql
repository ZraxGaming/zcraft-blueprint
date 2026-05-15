ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki ENABLE ROW LEVEL SECURITY;

-- forum_replies had no policies; add sensible defaults
CREATE POLICY "Replies: public select" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Replies: insert as owner" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Replies: update own or admin" ON public.forum_replies FOR UPDATE TO authenticated USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')) WITH CHECK (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY "Replies: delete own or admin" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','moderator')));