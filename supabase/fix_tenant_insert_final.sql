-- ============================================
-- SOLUÇÃO FINAL: Função simples que retorna UUID
-- ============================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can create tenant during signup" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenant during signup" ON tenants;

-- Criar função simples que retorna apenas o tenant_id
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
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
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
    p_user_id,
    v_tenant_id,
    p_user_name,
    p_user_email,
    'admin'
  );

  RETURN v_tenant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_tenant_and_user TO authenticated, anon;




