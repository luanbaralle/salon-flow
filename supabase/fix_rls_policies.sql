-- ============================================
-- CORREÇÃO: Remover políticas com recursão infinita
-- ============================================

-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
DROP POLICY IF EXISTS "Admins can update their tenant" ON tenants;

-- Criar função helper que bypassa RLS para obter tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO user_tenant_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_tenant_id;
END;
$$;

-- Recriar políticas usando a função helper

-- Política para tenants (permite ver o próprio tenant)
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (id = get_user_tenant_id());

CREATE POLICY "Admins can update their tenant" ON tenants
    FOR UPDATE USING (id = get_user_tenant_id() AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Política para users (permite ver usuários do mesmo tenant)
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Atualizar outras políticas que usam a mesma lógica
DROP POLICY IF EXISTS "Users can view professionals in their tenant" ON professionals;
DROP POLICY IF EXISTS "Admins can manage professionals" ON professionals;
DROP POLICY IF EXISTS "Users can view services in their tenant" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Users can view clients in their tenant" ON clients;
DROP POLICY IF EXISTS "Admins can manage clients" ON clients;
DROP POLICY IF EXISTS "Users can view appointments in their tenant" ON appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view transactions in their tenant" ON transactions;
DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view campaigns in their tenant" ON campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;

-- Recriar políticas usando a função helper

-- Professionals
CREATE POLICY "Users can view professionals in their tenant" ON professionals
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage professionals" ON professionals
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Services
CREATE POLICY "Users can view services in their tenant" ON services
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clients
CREATE POLICY "Users can view clients in their tenant" ON clients
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage clients" ON clients
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Appointments
CREATE POLICY "Users can view appointments in their tenant" ON appointments
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage appointments" ON appointments
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Transactions
CREATE POLICY "Users can view transactions in their tenant" ON transactions
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage transactions" ON transactions
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Campaigns
CREATE POLICY "Users can view campaigns in their tenant" ON campaigns
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage campaigns" ON campaigns
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );


