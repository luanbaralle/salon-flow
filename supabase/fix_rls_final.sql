-- ============================================
-- CORREÇÃO FINAL: Políticas RLS que funcionam
-- ============================================

-- 1. Corrigir política de tenants (erro 500 ao buscar)
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

-- Política que permite ver tenant se o usuário tem esse tenant_id na tabela users
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        -- Verificar se existe um user com esse tenant_id e id = auth.uid()
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = tenants.id
        )
    );

-- 2. Corrigir política de users (erro 500/406 ao buscar)
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Política simples: usuário pode ver seu próprio perfil
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Política para ver outros usuários do mesmo tenant
-- Usar JOIN direto para evitar recursão
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (
        -- Pode ver próprio perfil
        id = auth.uid() OR
        -- OU se tem o mesmo tenant_id que o usuário autenticado
        (tenant_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM users u2 
            WHERE u2.id = auth.uid() 
            AND u2.tenant_id IS NOT NULL
            AND u2.tenant_id = users.tenant_id
        ))
    );

-- 3. Verificar se a função get_user_tenant_id está funcionando
-- Se não estiver, recriar
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
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

