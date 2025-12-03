-- ============================================
-- CORREÇÃO: Permitir inserção de tenants durante registro
-- ============================================

-- Remover políticas existentes de INSERT (se houver)
DROP POLICY IF EXISTS "Admins can create tenant" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenant" ON tenants;

-- Criar política que permite INSERT de tenants para usuários autenticados
-- Isso é necessário durante o registro, quando o usuário ainda não tem um tenant
-- A verificação é: usuário autenticado E ainda não tem um tenant (não existe na tabela users)
CREATE POLICY "Authenticated users can create tenant during signup" ON tenants
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

-- Também precisamos permitir que o usuário insira seu próprio registro na tabela users
-- durante o processo de registro
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Atualizar política de SELECT para tenants para permitir ver tenant recém-criado
-- Mesmo que o usuário ainda não esteja na tabela users, se ele criou o tenant, pode vê-lo
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        -- Pode ver se tem um registro na tabela users com esse tenant_id
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid()) OR
        -- OU se é um usuário autenticado que ainda não tem registro em users
        -- (durante o processo de registro)
        (auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid()))
    );

