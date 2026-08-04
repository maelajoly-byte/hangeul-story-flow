CREATE TABLE public.series (
  id text PRIMARY KEY,
  order_index integer NOT NULL DEFAULT 1,
  title text NOT NULL DEFAULT 'Nouvelle histoire',
  title_ko text NOT NULL DEFAULT '',
  synopsis text NOT NULL DEFAULT '',
  stars numeric(2,1) NOT NULL DEFAULT 1,
  episodes integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'coming_soon',
  moods text[] NOT NULL DEFAULT '{}',
  cover_from text NOT NULL DEFAULT '#0b1220',
  cover_to text NOT NULL DEFAULT '#2b1450',
  cover_symbol text NOT NULL DEFAULT '',
  cover_image_url text,
  free boolean NOT NULL DEFAULT false,
  warnings text[] NOT NULL DEFAULT '{}',
  tips text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.series TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.series TO authenticated;
GRANT ALL ON public.series TO service_role;

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY series_public_read ON public.series FOR SELECT USING (true);
CREATE POLICY series_admin_write ON public.series FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON public.series
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.series (id, order_index, title, title_ko, synopsis, stars, episodes, status, moods, cover_from, cover_to, cover_symbol, free, warnings, tips) VALUES
('ghost-of-the-past', 1, 'Ghost of the Past', '과거의 유령', 'Une lycéenne reçoit un message d''un numéro qu''elle a effacé il y a dix ans.', 1, 16, 'available', ARRAY['Mystère','Drame','Surnaturel léger'], '#0b1220', '#2b1450', '유', true, ARRAY['Atmosphère sombre','Apparition fantomatique'], ARRAY['Cliquez sur chaque particule pour comprendre la nuance.','Laissez le contexte faire le travail : les mots reviennent d''eux-mêmes.']),
('reality', 2, 'Reality', '현실', 'Un cadre fatigué découvre que ses collègues ne se souviennent plus de lui.', 2, 10, 'available', ARRAY['Drame','Psychologique'], '#1a1a2e', '#0f3460', '현', false, '{}', '{}'),
('supernatural-chase', 3, 'Supernatural Chase', '초자연 추격', 'Une chasseuse de fantômes traque une entité qui change de visage.', 3, 12, 'in_progress', ARRAY['Action','Surnaturel','Suspense'], '#1b1035', '#5b2a86', '초', false, '{}', '{}'),
('z-virus', 4, 'Z-Virus', 'Z-바이러스', 'Un campus universitaire isolé, un virus qui ne dit pas son nom.', 3, 14, 'coming_soon', ARRAY['Horreur','Survie'], '#1a0b0b', '#5b1f1f', 'Z', false, '{}', '{}'),
('clash', 5, 'Clash', '충돌', 'Deux familles, une fusion d''entreprise, un secret qui resurgit.', 4, 10, 'coming_soon', ARRAY['Drame','Corporate'], '#0c1a2b', '#1f4068', '충', false, '{}', '{}'),
('elevator-game', 6, 'Elevator Game', '엘리베이터 게임', 'Sept étages. Cinq règles. Une seule sortie.', 4, 7, 'coming_soon', ARRAY['Horreur','Mystère'], '#0a0a0a', '#2c2c2c', '엘', false, '{}', '{}'),
('shattered', 7, 'Shattered', '깨진', 'Le miroir de la salle de bain montre un autre appartement.', 4, 9, 'coming_soon', ARRAY['Surnaturel','Drame'], '#13202b', '#3d6478', '깨', false, '{}', '{}'),
('protocol-unknown', 8, 'Protocol Unknown', '미확인 프로토콜', 'Une IA d''aide à la décision commence à mentir — peut-être.', 5, 11, 'coming_soon', ARRAY['SF','Thriller'], '#0a1f2c', '#0e7490', '미', false, '{}', '{}'),
('siren-call', 9, 'Siren Call', '세이렌의 부름', 'Un port de pêche, une voix dans la brume, et personne qui rentre.', 5, 12, 'coming_soon', ARRAY['Horreur folklorique','Drame'], '#0b1f2b', '#264653', '세', false, '{}', '{}');