-- Conteúdo editável do site (textos e imagens) por admins.
-- "key" identifica o bloco (ex: "home.hero.title", "galeria.foto_1");
-- "value" é o texto em si, ou a URL pública do arquivo no Storage quando type = 'image'.
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('text', 'image')),
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_content TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is publicly readable"
  ON public.site_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket "site-content" já criado via API (público, leitura livre por padrão).
-- Restringe escrita de arquivos só para admins.
CREATE POLICY "Admins can upload site content images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-content' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-content' AND public.has_role(auth.uid(), 'admin'));
