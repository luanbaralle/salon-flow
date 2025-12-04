-- ============================================
-- CORREÇÃO FINAL: Resolver erro 500 ao buscar user profile
-- ============================================

-- A política atual está causando recursão ou erro 500
-- Vamos simplificar ao máximo

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- 2. Criar política MUITO simples: usuário pode ver seu próprio perfil
-- Esta é a política mais básica e não deve causar erro 500
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT 
    USING (id = auth.uid());

-- 3. Política para ver outros usuários do mesmo tenant
-- Usar verificação direta sem subquery complexa
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT 
    USING (
        -- Sempre pode ver próprio perfil
        id = auth.uid() OR
        -- OU verificar se tem o mesmo tenant_id usando JOIN direto
        (
            tenant_id IS NOT NULL 
            AND tenant_id IN (
                SELECT u2.tenant_id 
                FROM users u2 
                WHERE u2.id = auth.uid() 
                AND u2.tenant_id IS NOT NULL
            )
        )
    );

-- 4. Verificar se a função get_user_tenant_id está funcionando
-- Se não estiver, pode estar causando problemas nas outras políticas
-- Vamos garantir que ela está correta
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



