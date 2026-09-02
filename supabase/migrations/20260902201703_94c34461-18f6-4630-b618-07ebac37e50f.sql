
ALTER TABLE public.story_parts ADD COLUMN IF NOT EXISTS title_ko text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.story_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id text NOT NULL,
  episode integer NOT NULL,
  title text NOT NULL DEFAULT '',
  title_ko text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, episode)
);

GRANT SELECT ON public.story_episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_episodes TO authenticated;
GRANT ALL ON public.story_episodes TO service_role;
ALTER TABLE public.story_episodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS story_episodes_public_read ON public.story_episodes;
CREATE POLICY story_episodes_public_read ON public.story_episodes FOR SELECT USING (true);
DROP POLICY IF EXISTS story_episodes_admin_write ON public.story_episodes;
CREATE POLICY story_episodes_admin_write ON public.story_episodes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Tighten table grants to match the policies.
REVOKE ALL ON public.profiles, public.notifications, public.lexicon_requests FROM anon;
REVOKE ALL ON public.series, public.story_parts, public.story_slides, public.lexicon_entries FROM anon;
GRANT SELECT ON public.series, public.story_parts, public.story_slides, public.lexicon_entries TO anon;

REVOKE ALL ON public.notifications FROM authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

REVOKE ALL ON public.lexicon_requests FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lexicon_requests TO authenticated;

REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

GRANT ALL ON public.series, public.story_parts, public.story_slides, public.lexicon_entries,
  public.lexicon_requests, public.notifications, public.profiles TO service_role;
