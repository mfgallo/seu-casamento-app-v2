-- Galeria dinâmica: lista de fotos gerenciável pelo admin (adicionar/remover),
-- em vez de um número fixo de slots. "image_url" aponta pro bucket "site-content"
-- no Storage (pasta gallery/), que já tem política de escrita restrita a admin.
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT ON public.gallery_photos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery photos are publicly readable"
  ON public.gallery_photos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage gallery photos"
  ON public.gallery_photos
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
