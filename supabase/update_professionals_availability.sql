-- ============================================
-- Atualizar profissionais sem disponibilidade
-- ============================================

-- Atualizar profissionais que não têm disponibilidade configurada
UPDATE professionals
SET availability = jsonb_build_object(
  'monday', jsonb_build_object('open', true, 'start', '09:00', 'end', '18:00'),
  'tuesday', jsonb_build_object('open', true, 'start', '09:00', 'end', '18:00'),
  'wednesday', jsonb_build_object('open', true, 'start', '09:00', 'end', '18:00'),
  'thursday', jsonb_build_object('open', true, 'start', '09:00', 'end', '18:00'),
  'friday', jsonb_build_object('open', true, 'start', '09:00', 'end', '18:00'),
  'saturday', jsonb_build_object('open', true, 'start', '09:00', 'end', '14:00'),
  'sunday', jsonb_build_object('open', false, 'start', '', 'end', '')
)
WHERE availability IS NULL 
   OR availability = '{}'::jsonb
   OR jsonb_typeof(availability) = 'null';

