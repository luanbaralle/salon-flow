-- Tabela de relacionamento para múltiplos serviços por agendamento
CREATE TABLE IF NOT EXISTS appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(appointment_id, service_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment_id ON appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_services_service_id ON appointment_services(service_id);

-- RLS Policies
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver appointment_services do seu tenant
CREATE POLICY "Users can view appointment_services from their tenant"
  ON appointment_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN users u ON u.tenant_id = a.tenant_id
      WHERE a.id = appointment_services.appointment_id
      AND u.id = auth.uid()
    )
  );

-- Policy: Usuários podem inserir appointment_services do seu tenant
CREATE POLICY "Users can insert appointment_services from their tenant"
  ON appointment_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN users u ON u.tenant_id = a.tenant_id
      WHERE a.id = appointment_services.appointment_id
      AND u.id = auth.uid()
    )
  );

-- Policy: Usuários podem deletar appointment_services do seu tenant
CREATE POLICY "Users can delete appointment_services from their tenant"
  ON appointment_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN users u ON u.tenant_id = a.tenant_id
      WHERE a.id = appointment_services.appointment_id
      AND u.id = auth.uid()
    )
  );

-- Migrar dados existentes: criar registro em appointment_services para cada agendamento existente
INSERT INTO appointment_services (appointment_id, service_id)
SELECT id, service_id FROM appointments
WHERE service_id IS NOT NULL
ON CONFLICT (appointment_id, service_id) DO NOTHING;

