-- ============================================
-- CORREÇÃO: Resolver erro 500 nas queries
-- ============================================

-- 1. Recriar função get_user_tenant_id de forma mais segura
-- Usar CREATE OR REPLACE para não quebrar dependências
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

-- 2. Corrigir política de tenants (simplificar para evitar erro 500)
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        -- Verificar diretamente na tabela users sem usar função
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = tenants.id
        )
    );

-- 3. Corrigir política de users (simplificar)
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Política mais simples: usuário pode ver seu próprio perfil
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Política para ver outros usuários do mesmo tenant (sem recursão)
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (
        -- Sempre pode ver próprio perfil
        id = auth.uid() OR
        -- OU se ambos têm o mesmo tenant_id (verificação direta)
        (
            tenant_id IS NOT NULL 
            AND EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.tenant_id IS NOT NULL
                AND u.tenant_id = users.tenant_id
            )
        )
    );

-- 4. Garantir que a função tem permissões
GRANT EXECUTE ON FUNCTION get_user_tenant_id() TO authenticated, anon;

