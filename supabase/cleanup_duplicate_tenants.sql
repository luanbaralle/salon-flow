-- ============================================
-- LIMPEZA: Remover tenants duplicados/órfãos
-- ============================================

-- Ver tenants sem usuários associados
SELECT 
  t.id,
  t.name,
  t.slug,
  t.created_at,
  'Sem usuário' as status
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
WHERE u.id IS NULL;

-- Ver tenants com slugs duplicados
SELECT 
  slug,
  COUNT(*) as count,
  array_agg(id::text) as tenant_ids
FROM tenants
GROUP BY slug
HAVING COUNT(*) > 1;

-- Limpar tenants órfãos (sem usuários)
-- CUIDADO: Isso vai deletar tenants que não têm usuários associados
-- Execute apenas se tiver certeza!
DELETE FROM tenants 
WHERE id NOT IN (
  SELECT DISTINCT tenant_id 
  FROM users 
  WHERE tenant_id IS NOT NULL
);

-- OU, se quiser manter apenas o tenant mais recente de cada slug duplicado:
-- (Descomente se necessário)
/*
WITH ranked_tenants AS (
  SELECT 
    id,
    slug,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at DESC) as rn
  FROM tenants
)
DELETE FROM tenants
WHERE id IN (
  SELECT id FROM ranked_tenants WHERE rn > 1
);
*/

