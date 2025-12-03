-- ============================================
-- Tabela de Avaliações/Reviews
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(appointment_id) -- Um agendamento só pode ter uma avaliação
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver avaliações do seu tenant
CREATE POLICY "Users can view reviews in their tenant" ON reviews
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Política: Permitir criação de avaliações (público ou autenticado)
-- Valida que o agendamento existe, está concluído e pertence ao cliente correto
CREATE POLICY "Allow review creation for completed appointments" ON reviews
  FOR INSERT WITH CHECK (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE id = reviews.appointment_id
      AND status = 'completed'
      AND client_id = reviews.client_id
    )
  );

-- Política: Admins podem atualizar/deletar avaliações
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Função para atualizar rating do profissional automaticamente
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professionals
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE professional_id = NEW.professional_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE professional_id = NEW.professional_id
    ),
    updated_at = NOW()
  WHERE id = NEW.professional_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar rating quando uma avaliação é criada
CREATE TRIGGER trigger_update_professional_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();

-- Trigger para atualizar rating quando uma avaliação é atualizada
CREATE TRIGGER trigger_update_professional_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
  EXECUTE FUNCTION update_professional_rating();

-- Trigger para atualizar rating quando uma avaliação é deletada
CREATE OR REPLACE FUNCTION update_professional_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professionals
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE professional_id = OLD.professional_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE professional_id = OLD.professional_id
    ),
    updated_at = NOW()
  WHERE id = OLD.professional_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_professional_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating_on_delete();

