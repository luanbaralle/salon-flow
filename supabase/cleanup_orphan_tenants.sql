-- ============================================
-- LIMPEZA: Remover tenants órfãos específicos
-- ============================================

-- Deletar os 3 tenants órfãos identificados
DELETE FROM tenants 
WHERE id IN (
  '5749a1cf-b061-4bde-a9f6-11411f795cbb',
  'ed3c8df8-d46e-4407-a0dc-48806c657466',
  'f6c62879-504f-480d-a6a6-6e4fddeb9ba7'
);

-- Verificar se foram deletados
SELECT COUNT(*) as remaining_orphans
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
WHERE u.id IS NULL;

-- Se quiser deletar TODOS os tenants órfãos (mais agressivo):
-- DELETE FROM tenants 
-- WHERE id NOT IN (
--   SELECT DISTINCT tenant_id 
--   FROM users 
--   WHERE tenant_id IS NOT NULL
-- );

