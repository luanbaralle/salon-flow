-- ============================================
-- CORREÇÃO FINAL: Remover recursão infinita
-- ============================================

-- O problema é que a política "Users can view users in their tenant"
-- está fazendo SELECT na tabela users dentro da própria política,
-- causando recursão infinita.
-- 
-- Exemplo problemático:
-- CREATE POLICY "Users can view users in their tenant" ON users
--     FOR SELECT USING (
--         tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
--     );
-- 
-- Isso causa recursão porque para verificar se pode ver um user,
-- precisa fazer SELECT em users, que por sua vez precisa verificar
-- a política, que faz SELECT em users novamente... infinito!

-- SOLUÇÃO: Remover a política problemática e deixar apenas
-- a política mais simples possível

-- 1. Remover TODAS as políticas de SELECT da tabela users
-- (incluindo a do schema original que causa recursão)
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- 2. Criar APENAS uma política simples: usuário pode ver seu próprio perfil
-- Esta é a política mais básica e não causa recursão
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT 
    USING (id = auth.uid());

-- 3. Para ver outros usuários do mesmo tenant, vamos usar uma função
-- SECURITY DEFINER que bypassa RLS
CREATE OR REPLACE FUNCTION get_users_in_tenant()
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  -- Buscar tenant_id do usuário autenticado (bypass RLS)
  SELECT tenant_id INTO user_tenant_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Retornar todos os usuários do mesmo tenant
  RETURN QUERY
  SELECT 
    u.id,
    u.tenant_id,
    u.name,
    u.email,
    u.role,
    u.avatar_url,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.tenant_id = user_tenant_id;
END;
$$;

-- 4. Garantir permissões
GRANT EXECUTE ON FUNCTION get_users_in_tenant() TO authenticated;

-- 5. Verificar se a função get_user_tenant_id está correta
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

