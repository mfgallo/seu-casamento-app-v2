-- Qualquer usuário autenticado (noivo, fornecedor ou admin) pode publicar
-- o próprio depoimento. Atualizar/remover continua restrito a admin (já
-- coberto pela policy "Admins can manage testimonials", FOR ALL).
CREATE POLICY "Authenticated users can add testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
