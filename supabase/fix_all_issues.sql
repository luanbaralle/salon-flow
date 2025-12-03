-- ============================================
-- CORREÇÃO COMPLETA: Resolver todos os problemas
-- ============================================

-- 1. Remover todas as versões da função
DROP FUNCTION IF EXISTS create_tenant_and_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_tenant_and_user(TEXT, TEXT, TEXT, TEXT, TEXT);

-- 2. Criar função correta com todos os parâmetros nomeados
CREATE OR REPLACE FUNCTION create_tenant_and_user(
  p_user_id UUID,
  p_salon_name TEXT,
  p_salon_phone TEXT,
  p_salon_address TEXT,
  p_user_name TEXT,
  p_user_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_slug TEXT;
BEGIN
  -- Validações
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User already has a tenant';
  END IF;

  -- Criar slug único (adicionar UUID para garantir unicidade)
  v_slug := lower(p_salon_name);
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '^-|-$', '', 'g');
  -- Adicionar parte do UUID para garantir unicidade
  v_slug := v_slug || '-' || substring(p_user_id::text, 1, 8);

  -- Criar tenant
  INSERT INTO tenants (
    name,
    slug,
    phone,
    address,
    working_hours,
    booking_rules
  ) VALUES (
    p_salon_name,
    v_slug,
    p_salon_phone,
    p_salon_address,
    jsonb_build_object(
      'monday', jsonb_build_object('open', true, 'start', '09:00', 'end', '19:00'),
      'tuesday', jsonb_build_object('open', true, 'start', '09:00', 'end', '19:00'),
      'wednesday', jsonb_build_object('open', true, 'start', '09:00', 'end', '19:00'),
      'thursday', jsonb_build_object('open', true, 'start', '09:00', 'end', '19:00'),
      'friday', jsonb_build_object('open', true, 'start', '09:00', 'end', '19:00'),
      'saturday', jsonb_build_object('open', true, 'start', '09:00', 'end', '15:00'),
      'sunday', jsonb_build_object('open', false, 'start', '', 'end', '')
    ),
    jsonb_build_object(
      'minAdvanceHours', 2,
      'maxAdvanceDays', 30,
      'allowOnlinePayment', true,
      'requireDeposit', false,
      'depositPercentage', 0
    )
  )
  RETURNING id INTO v_tenant_id;

  -- Criar user profile
  INSERT INTO users (
    id,
    tenant_id,
    name,
    email,
    role
  ) VALUES (
    p_user_id,
    v_tenant_id,
    p_user_name,
    p_user_email,
    'admin'
  );

  RETURN v_tenant_id;
END;
$$;

-- 3. Garantir permissões
GRANT EXECUTE ON FUNCTION create_tenant_and_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- 4. Corrigir políticas de SELECT que estão causando erro 406
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- 5. Política para users (corrigir erro 406)
-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Política simples: usuário pode ver seu próprio perfil
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Política para ver outros usuários do mesmo tenant (sem recursão)
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (
        -- Pode ver próprio perfil
        id = auth.uid() OR
        -- OU se tem tenant_id e existe um user com esse tenant_id e id = auth.uid()
        (tenant_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM users u2 
            WHERE u2.id = auth.uid() 
            AND u2.tenant_id = users.tenant_id
            AND u2.tenant_id IS NOT NULL
        ))
    );

-- 6. Limpar dados de teste/parciais se necessário
-- (Descomente se quiser limpar tudo)
-- DELETE FROM users WHERE id NOT IN (SELECT id FROM auth.users);
-- DELETE FROM tenants WHERE id NOT IN (SELECT tenant_id FROM users WHERE tenant_id IS NOT NULL);


