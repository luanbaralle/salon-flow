# Plano de Implementação Completa - Salon Flow com Supabase

## 📋 Visão Geral

Este documento detalha como transformar o projeto frontend em uma aplicação completa e funcional usando **Supabase** como backend (banco de dados PostgreSQL, autenticação, storage, e real-time).

---

## 🏗️ Arquitetura Proposta

```
Frontend (React + TypeScript)
    ↓
Supabase Client (JavaScript SDK)
    ↓
┌─────────────────────────────────────┐
│         Supabase Services           │
├─────────────────────────────────────┤
│ • Auth (Autenticação)               │
│ • Database (PostgreSQL)             │
│ • Storage (Arquivos/Imagens)        │
│ • Realtime (WebSockets)             │
│ • Edge Functions (Opcional)         │
└─────────────────────────────────────┘
```

---

## 📊 Estrutura do Banco de Dados

### 1. Tabelas Principais

#### **tenants** (Multi-tenancy - Salões)
```sql
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
```

#### **users** (Usuários do sistema)
```sql
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
```

#### **professionals** (Profissionais)
```sql
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
```

#### **services** (Serviços)
```sql
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
```

#### **service_professionals** (Relação N:N - Serviços e Profissionais)
```sql
CREATE TABLE service_professionals (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, professional_id)
);
```

#### **clients** (Clientes)
```sql
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
```

#### **appointments** (Agendamentos)
```sql
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
```

#### **transactions** (Transações Financeiras)
```sql
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
```

#### **campaigns** (Campanhas de Marketing)
```sql
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
```

#### **notifications** (Notificações)
```sql
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
```

### 2. Índices e Performance

```sql
-- Índices para melhor performance
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, date);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_professionals_tenant ON professionals(tenant_id);
CREATE INDEX idx_services_tenant ON services(tenant_id);
CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
```

### 3. Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo (ajustar conforme necessário)
-- Usuários só podem ver dados do seu tenant
CREATE POLICY "Users can only see their tenant data" ON appointments
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );
```

---

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Registro de Salão (Admin)**
   - Criar conta no Supabase Auth
   - Criar tenant
   - Criar user com role 'admin'
   - Criar perfil inicial

2. **Login**
   - Autenticar via Supabase Auth
   - Buscar dados do user e tenant
   - Armazenar sessão

3. **Profissionais**
   - Admin cria profissional
   - Opcional: criar conta de usuário para o profissional
   - Profissional pode fazer login e ver apenas seus agendamentos

4. **Clientes**
   - Podem criar conta opcionalmente
   - Agendamentos podem ser feitos sem conta (apenas com dados)

---

## 📦 Estrutura de Pastas Proposta

```
src/
├── lib/
│   └── supabase.ts              # Cliente Supabase
├── services/
│   ├── auth.service.ts          # Serviço de autenticação
│   ├── tenants.service.ts        # Serviço de tenants
│   ├── professionals.service.ts  # CRUD profissionais
│   ├── services.service.ts       # CRUD serviços
│   ├── clients.service.ts        # CRUD clientes
│   ├── appointments.service.ts   # CRUD agendamentos
│   ├── transactions.service.ts  # CRUD transações
│   ├── campaigns.service.ts      # CRUD campanhas
│   └── notifications.service.ts  # CRUD notificações
├── hooks/
│   ├── useAuth.ts                # Hook de autenticação
│   ├── useTenant.ts              # Hook de tenant
│   ├── useProfessionals.ts       # Hook profissionais
│   ├── useServices.ts            # Hook serviços
│   ├── useClients.ts             # Hook clientes
│   ├── useAppointments.ts         # Hook agendamentos
│   ├── useTransactions.ts        # Hook transações
│   ├── useCampaigns.ts           # Hook campanhas
│   └── useNotifications.ts       # Hook notificações
├── contexts/
│   └── AuthContext.tsx           # Contexto de autenticação atualizado
└── types/
    └── database.types.ts          # Tipos TypeScript do Supabase
```

---

## 🚀 Implementação Passo a Passo

### Fase 1: Configuração Inicial

1. **Instalar dependências**
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react
```

2. **Configurar variáveis de ambiente**
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Criar cliente Supabase**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Fase 2: Autenticação

1. **Atualizar Login.tsx** para usar Supabase Auth
2. **Atualizar Register.tsx** para criar tenant e user
3. **Criar AuthContext** com Supabase
4. **Proteger rotas** com guards

### Fase 3: CRUD de Entidades

1. **Profissionais** - Criar, ler, atualizar, deletar
2. **Serviços** - CRUD completo
3. **Clientes** - CRUD completo
4. **Agendamentos** - CRUD com validações
5. **Transações** - CRUD financeiro
6. **Campanhas** - CRUD marketing
7. **Notificações** - Sistema de notificações

### Fase 4: Funcionalidades Avançadas

1. **Agendamento Online** - Fluxo completo para clientes
2. **Dashboard** - Estatísticas em tempo real
3. **Financeiro** - Relatórios e gráficos
4. **Marketing** - Envio de campanhas
5. **Notificações** - Sistema de alertas
6. **Configurações** - Gerenciamento do salão

---

## 🔧 Serviços e Hooks

### Exemplo: Serviço de Profissionais

```typescript
// src/services/professionals.service.ts
import { supabase } from '@/lib/supabase'
import type { Professional } from '@/types'

export const professionalsService = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(tenantId: string, professional: Omit<Professional, 'id'>) {
    const { data, error } = await supabase
      .from('professionals')
      .insert({ ...professional, tenant_id: tenantId })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Professional>) {
    const { data, error } = await supabase
      .from('professionals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
```

### Exemplo: Hook de Profissionais

```typescript
// src/hooks/useProfessionals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { professionalsService } from '@/services/professionals.service'
import { useAuth } from '@/hooks/useAuth'

export function useProfessionals() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals', user?.tenant_id],
    queryFn: () => professionalsService.getAll(user!.tenant_id),
    enabled: !!user?.tenant_id
  })

  const createMutation = useMutation({
    mutationFn: (professional: Omit<Professional, 'id'>) =>
      professionalsService.create(user!.tenant_id, professional),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Professional> }) =>
      professionalsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => professionalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    }
  })

  return {
    professionals,
    isLoading,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
```

---

## 📱 Funcionalidades Detalhadas

### 1. Agendamento

**Funcionalidades:**
- Visualização em calendário (dia/semana/mês)
- Criação de agendamentos
- Edição e cancelamento
- Validação de horários disponíveis
- Conflitos de horário
- Notificações automáticas

**Implementação:**
- Usar `appointments` table
- Validar disponibilidade do profissional
- Verificar conflitos de horário
- Criar notificações automáticas
- Atualizar estatísticas do cliente

### 2. Cadastro de Clientes

**Funcionalidades:**
- CRUD completo
- Histórico de agendamentos
- Histórico financeiro
- Notas e observações
- Upload de avatar (Supabase Storage)

**Implementação:**
- Tabela `clients`
- Relacionamento com `appointments`
- Cálculo automático de `total_spent` e `visit_count`
- Storage para avatares

### 3. Cadastro de Profissionais

**Funcionalidades:**
- CRUD completo
- Configuração de disponibilidade
- Comissões
- Avaliações
- Relacionamento com serviços

**Implementação:**
- Tabela `professionals`
- Tabela `service_professionals` (N:N)
- JSONB para disponibilidade
- Cálculo de comissões

### 4. Cadastro de Serviços

**Funcionalidades:**
- CRUD completo
- Categorias
- Preços e duração
- Relacionamento com profissionais
- Upload de imagens

**Implementação:**
- Tabela `services`
- Tabela `service_professionals`
- Storage para imagens
- Validações de preço e duração

### 5. Financeiro

**Funcionalidades:**
- Registro de receitas e despesas
- Relatórios por período
- Gráficos de faturamento
- Cálculo de comissões
- Exportação de dados

**Implementação:**
- Tabela `transactions`
- Queries agregadas para relatórios
- Cálculo automático ao completar agendamento
- Integração com dashboard

### 6. Campanhas de Marketing

**Funcionalidades:**
- Criação de campanhas
- Agendamento de envio
- Segmentação de público
- Métricas de abertura
- Templates de mensagem

**Implementação:**
- Tabela `campaigns`
- Integração com serviços de email/SMS/WhatsApp
- Tracking de métricas
- Filtros de público-alvo

### 7. Configurações

**Funcionalidades:**
- Dados do salão
- Horários de funcionamento
- Políticas de cancelamento
- Regras de agendamento
- Integrações

**Implementação:**
- Tabela `tenants`
- JSONB para configurações complexas
- Validações de horários
- Atualização em tempo real

### 8. Notificações

**Funcionalidades:**
- Notificações em tempo real
- Marcar como lida
- Filtros por categoria
- Histórico

**Implementação:**
- Tabela `notifications`
- Supabase Realtime para atualizações
- Triggers no banco para criar notificações
- Sistema de badges

---

## 🔔 Notificações e Real-time

### Usar Supabase Realtime

```typescript
// Exemplo: Escutar novos agendamentos
useEffect(() => {
  const channel = supabase
    .channel('appointments')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'appointments',
      filter: `tenant_id=eq.${tenantId}`
    }, (payload) => {
      // Criar notificação
      createNotification({
        title: 'Novo agendamento',
        message: `${payload.new.client_name} agendou ${payload.new.service_name}`,
        type: 'success',
        category: 'appointment'
      })
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [tenantId])
```

---

## 📊 Dashboard e Relatórios

### Queries Agregadas

```typescript
// Exemplo: Faturamento mensal
const { data } = await supabase
  .from('transactions')
  .select('amount')
  .eq('tenant_id', tenantId)
  .eq('type', 'income')
  .gte('date', startOfMonth)
  .lte('date', endOfMonth)

const total = data?.reduce((sum, t) => sum + t.amount, 0) || 0
```

---

## 🎨 Melhorias de UX

1. **Loading States** - Skeleton loaders
2. **Error Handling** - Toast notifications
3. **Optimistic Updates** - Atualizar UI antes da resposta
4. **Cache Management** - React Query cache
5. **Offline Support** - Service Workers (opcional)

---

## 🔒 Segurança

1. **Row Level Security (RLS)** - Políticas no Supabase
2. **Validação de Dados** - Zod schemas
3. **Sanitização** - Prevenir SQL injection
4. **Rate Limiting** - Limitar requisições
5. **CORS** - Configurar no Supabase

---

## 📝 Próximos Passos

1. ✅ Criar projeto no Supabase
2. ✅ Executar SQL schema
3. ✅ Configurar RLS policies
4. ✅ Instalar dependências
5. ✅ Criar serviços base
6. ✅ Implementar autenticação
7. ✅ Implementar CRUDs
8. ✅ Adicionar real-time
9. ✅ Testes e validações
10. ✅ Deploy

---

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## ⚠️ Considerações Importantes

1. **Multi-tenancy**: Garantir isolamento de dados por tenant
2. **Performance**: Usar índices adequados
3. **Escalabilidade**: Considerar paginação em listas grandes
4. **Backup**: Configurar backups automáticos no Supabase
5. **Monitoramento**: Usar Supabase Dashboard para monitorar

---

Este documento serve como guia completo para implementação. Cada seção pode ser expandida conforme necessário durante o desenvolvimento.





