ALTER TABLE public.story_parts ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
UPDATE public.story_parts SET published = true;

DROP POLICY IF EXISTS story_parts_public_read ON public.story_parts;
CREATE POLICY story_parts_public_read ON public.story_parts
FOR SELECT USING (published OR public.is_admin());