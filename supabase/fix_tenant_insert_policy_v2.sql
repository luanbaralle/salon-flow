-- ============================================
-- CORREÇÃO: Função para criar tenant e user de forma segura
-- ============================================

-- Remover função existente se houver (pode ter assinatura diferente)
DROP FUNCTION IF EXISTS create_tenant_and_user(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_tenant_and_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Criar função que permite criar tenant e user durante registro
-- Esta função usa SECURITY DEFINER para bypassar RLS
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
  v_user_id UUID;
  v_tenant_id UUID;
  v_slug TEXT;
BEGIN
  -- Usar o user_id passado como parâmetro
  v_user_id := p_user_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Verificar se o user_id existe no auth.users (validação de segurança)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;

  -- Verificar se usuário já tem tenant
  IF EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a tenant';
  END IF;

  -- Criar slug
  v_slug := lower(p_salon_name);
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '^-|-$', '', 'g');

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
    v_user_id,
    v_tenant_id,
    p_user_name,
    p_user_email,
    'admin'
  );

  -- Retornar apenas o tenant_id como UUID
  RETURN v_tenant_id;
END;
$$;

-- Política para permitir que usuários autenticados chamem a função
-- (funções SECURITY DEFINER já bypassam RLS, mas vamos garantir permissões)
-- Permitir para usuários autenticados e também para anon (durante signUp)
GRANT EXECUTE ON FUNCTION create_tenant_and_user TO authenticated, anon;

-- Atualizar política de SELECT para tenants
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

