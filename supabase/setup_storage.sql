-- ============================================
-- Configuração do Supabase Storage
-- ============================================

-- Criar bucket para imagens do salão
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-images', 'salon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de imagens (apenas usuários autenticados do tenant)
CREATE POLICY "Users can upload images in their tenant folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'salon-images' AND
  (storage.foldername(name))[1] IN (
    SELECT tenant_id::text FROM users WHERE id = auth.uid()
  )
);

-- Política para permitir leitura pública de imagens
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'salon-images');

-- Política para permitir atualização de imagens (apenas usuários autenticados do tenant)
CREATE POLICY "Users can update images in their tenant folder"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'salon-images' AND
  (storage.foldername(name))[1] IN (
    SELECT tenant_id::text FROM users WHERE id = auth.uid()
  )
);

-- Política para permitir deleção de imagens (apenas usuários autenticados do tenant)
CREATE POLICY "Users can delete images in their tenant folder"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'salon-images' AND
  (storage.foldername(name))[1] IN (
    SELECT tenant_id::text FROM users WHERE id = auth.uid()
  )
);



