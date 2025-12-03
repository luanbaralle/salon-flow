-- ============================================
-- SCHEMA COMPLETO - SALON FLOW
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tenants (Salões)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  website VARCHAR(255),
  working_hours JSONB DEFAULT '{}',
  cancellation_policy TEXT,
  booking_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (Usuários do sistema)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'professional', 'client')),
  avatar TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Professionals (Profissionais)
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  specialty VARCHAR(100),
  commission DECIMAL(5,2) DEFAULT 0,
  availability JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services (Serviços)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- em minutos
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service Professionals (Relação N:N)
CREATE TABLE service_professionals (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, professional_id)
);

-- Clients (Clientes)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar TEXT,
  notes TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Appointments (Agendamentos)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions (Transações Financeiras)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns (Campanhas de Marketing)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent', 'active')),
  target_audience TEXT,
  message TEXT,
  sent_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  scheduled_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications (Notificações)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('appointment', 'payment', 'system', 'marketing')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, date);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_professionals_tenant ON professionals(tenant_id);
CREATE INDEX idx_services_tenant ON services(tenant_id);
CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas com updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar transação ao completar agendamento
CREATE OR REPLACE FUNCTION create_transaction_on_complete()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';

CREATE TRIGGER trigger_create_transaction_on_complete
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION create_transaction_on_complete();

-- Função para criar notificação ao criar agendamento
CREATE OR REPLACE FUNCTION create_notification_on_appointment()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';

CREATE TRIGGER trigger_create_notification_on_appointment
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_appointment();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can update their tenant" ON tenants
    FOR UPDATE USING (
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para users
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Políticas para professionals
CREATE POLICY "Users can view professionals in their tenant" ON professionals
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage professionals" ON professionals
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para services
CREATE POLICY "Users can view services in their tenant" ON services
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para clients
CREATE POLICY "Users can view clients in their tenant" ON clients
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage clients" ON clients
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para appointments
CREATE POLICY "Users can view appointments in their tenant" ON appointments
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage appointments" ON appointments
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Professionals can view their appointments" ON appointments
    FOR SELECT USING (
        professional_id IN (SELECT id FROM professionals WHERE user_id = auth.uid())
    );

-- Políticas para transactions
CREATE POLICY "Users can view transactions in their tenant" ON transactions
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage transactions" ON transactions
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para campaigns
CREATE POLICY "Users can view campaigns in their tenant" ON campaigns
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage campaigns" ON campaigns
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para notifications
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir dados de exemplo (apenas para desenvolvimento)
-- Comentar em produção

-- INSERT INTO tenants (name, slug, phone, email, address, city, state, zip_code)
-- VALUES ('Studio Bella', 'studio-bella', '(11) 3456-7890', 'contato@studiobella.com', 
--         'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567');



