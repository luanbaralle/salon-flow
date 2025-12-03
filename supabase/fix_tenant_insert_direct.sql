-- ============================================
-- SOLUÇÃO ALTERNATIVA: Políticas RLS que permitem INSERT direto
-- ============================================

-- Remover função RPC (não vamos mais usar)
DROP FUNCTION IF EXISTS create_tenant_and_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Política para permitir INSERT de tenants para usuários autenticados que ainda não têm tenant
DROP POLICY IF EXISTS "Authenticated users can create tenant during signup" ON tenants;
DROP POLICY IF EXISTS "Users can create tenant" ON tenants;

CREATE POLICY "Users can create tenant during signup" ON tenants
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

-- Política para permitir INSERT de users para o próprio perfil
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política para permitir SELECT do tenant recém-criado
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid()) OR
        -- Permitir ver tenant se o usuário está autenticado mas ainda não tem registro em users
        -- (durante o processo de criação)
        (auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid()))
    );


