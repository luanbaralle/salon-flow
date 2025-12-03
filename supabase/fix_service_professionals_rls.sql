-- ============================================
-- CORREÇÃO: Políticas RLS para service_professionals
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view service_professionals in their tenant" ON service_professionals;
DROP POLICY IF EXISTS "Admins can manage service_professionals" ON service_professionals;

-- Política para visualizar associações de serviços e profissionais do tenant
CREATE POLICY "Users can view service_professionals in their tenant" ON service_professionals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_professionals.service_id
            AND s.tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
        )
    );

-- Política para admins inserirem associações
CREATE POLICY "Admins can insert service_professionals" ON service_professionals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_professionals.service_id
            AND s.tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
        )
        AND EXISTS (
            SELECT 1 FROM professionals p
            WHERE p.id = service_professionals.professional_id
            AND p.tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
        )
    );

-- Política para admins deletarem associações
CREATE POLICY "Admins can delete service_professionals" ON service_professionals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_professionals.service_id
            AND s.tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
        )
    );

