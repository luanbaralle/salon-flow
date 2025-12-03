-- ============================================
-- LIMPEZA: Remover registros parciais de registro
-- ============================================

-- Esta função ajuda a limpar dados parciais caso o registro tenha falhado
-- Use com cuidado! Execute apenas se necessário.

-- Ver registros órfãos (users sem tenant ou tenants sem user)
SELECT 
  'Users sem tenant' as tipo,
  u.id as user_id,
  u.email,
  u.created_at
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE t.id IS NULL;

SELECT 
  'Tenants sem user admin' as tipo,
  t.id as tenant_id,
  t.name,
  t.created_at
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id AND u.role = 'admin'
WHERE u.id IS NULL;

-- Para limpar um registro específico (substitua o UUID):
-- DELETE FROM users WHERE id = 'uuid-do-usuario-aqui';
-- DELETE FROM tenants WHERE id = 'uuid-do-tenant-aqui' AND NOT EXISTS (SELECT 1 FROM users WHERE tenant_id = tenants.id);

-- Função para limpar dados de um usuário específico
CREATE OR REPLACE FUNCTION cleanup_user_registration(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Buscar tenant_id do usuário
  SELECT tenant_id INTO v_tenant_id
  FROM users
  WHERE id = p_user_id;
  
  -- Deletar user
  DELETE FROM users WHERE id = p_user_id;
  
  -- Deletar tenant se não tiver mais usuários
  IF v_tenant_id IS NOT NULL THEN
    DELETE FROM tenants 
    WHERE id = v_tenant_id 
    AND NOT EXISTS (SELECT 1 FROM users WHERE tenant_id = v_tenant_id);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_user_registration TO authenticated, anon;


