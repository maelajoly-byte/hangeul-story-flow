ALTER TABLE public.story_slides
  ADD COLUMN IF NOT EXISTS bubble_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS bubble_position text NOT NULL DEFAULT 'bottom';