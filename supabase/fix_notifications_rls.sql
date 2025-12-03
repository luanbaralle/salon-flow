-- ============================================
-- CORREÇÃO: Permitir inserção de notificações via trigger
-- ============================================

-- O problema é que a função create_notification_on_appointment() está sendo
-- bloqueada pela RLS ao tentar inserir notificações.
-- Solução: Tornar a função SECURITY DEFINER para bypassar RLS

-- 1. Remover o trigger primeiro, depois a função
DROP TRIGGER IF EXISTS trigger_create_notification_on_appointment ON appointments;
DROP FUNCTION IF EXISTS create_notification_on_appointment();

CREATE OR REPLACE FUNCTION create_notification_on_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar admin do tenant
    SELECT id INTO admin_user_id
    FROM users
    WHERE tenant_id = NEW.tenant_id AND role = 'admin'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO notifications (tenant_id, user_id, title, message, type, category)
        VALUES (
            NEW.tenant_id,
            admin_user_id,
            'Novo agendamento',
            (SELECT name FROM clients WHERE id = NEW.client_id) || 
            ' agendou ' || (SELECT name FROM services WHERE id = NEW.service_id) || 
            ' para ' || NEW.date || ' às ' || NEW.start_time,
            'success',
            'appointment'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2. Garantir que a função tem permissões
GRANT EXECUTE ON FUNCTION create_notification_on_appointment() TO authenticated, anon;

-- 3. Adicionar política para permitir que admins criem notificações manualmente (opcional)
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Corrigir também a função de transações para garantir que funciona
DROP TRIGGER IF EXISTS trigger_create_transaction_on_complete ON appointments;
DROP FUNCTION IF EXISTS create_transaction_on_complete();

CREATE OR REPLACE FUNCTION create_transaction_on_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO transactions (tenant_id, appointment_id, type, category, description, amount, date)
        VALUES (NEW.tenant_id, NEW.id, 'income', 'Serviços', 
                'Serviço: ' || (SELECT name FROM services WHERE id = NEW.service_id),
                NEW.price, NEW.date);
        
        -- Atualizar estatísticas do cliente
        UPDATE clients
        SET total_spent = total_spent + NEW.price,
            visit_count = visit_count + 1,
            last_visit = NEW.date
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION create_transaction_on_complete() TO authenticated, anon;

-- Recriar o trigger de transações
CREATE TRIGGER trigger_create_transaction_on_complete
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION create_transaction_on_complete();

-- Recriar o trigger de notificações
CREATE TRIGGER trigger_create_notification_on_appointment
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_appointment();

-- 5. Verificar e corrigir políticas de appointments se necessário
-- As políticas já devem estar corretas, mas vamos garantir
DROP POLICY IF EXISTS "Users can view appointments in their tenant" ON appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can view their appointments" ON appointments;

-- Política para visualizar appointments do tenant
CREATE POLICY "Users can view appointments in their tenant" ON appointments
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- Política para admins gerenciarem appointments
CREATE POLICY "Admins can manage appointments" ON appointments
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Política para profissionais verem seus appointments
CREATE POLICY "Professionals can view their appointments" ON appointments
    FOR SELECT USING (
        professional_id IN (SELECT id FROM professionals WHERE user_id = auth.uid())
    );

