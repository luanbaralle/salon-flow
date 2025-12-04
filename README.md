# 💇‍♀️ Salon Flow

Sistema completo de gestão para salões de beleza, desenvolvido com React, TypeScript e Supabase. Gerencie agendamentos, clientes, profissionais, serviços, finanças e marketing em uma única plataforma moderna e intuitiva.

## ✨ Funcionalidades

### 🎯 Gestão Completa
- **Dashboard Administrativo** - Visão geral com estatísticas, gráficos e checklist de onboarding
- **Agenda Inteligente** - Calendário de agendamentos com visualização diária/semanal
  - ✅ **Múltiplos serviços por agendamento** - Adicione vários serviços em um único agendamento
  - ✅ **Cálculo automático** - Duração total e preço somados automaticamente
  - ✅ **Validação de conflitos** - Previne sobreposição de horários para o mesmo profissional
  - ✅ **Cadastro rápido** - Crie clientes, profissionais e serviços diretamente do modal de agendamento
  - ✅ **Visualização otimizada** - Cards de agendamento ocupam toda a área do horário
  - ✅ **Status visuais** - Cores semânticas (verde/amarelo/vermelho) para identificação rápida
- **Gestão de Clientes** - CRUD completo com histórico e estatísticas
- **Profissionais** - Gerenciamento de equipe com horários, disponibilidade e tags de especialidade
- **Serviços** - Catálogo de serviços com preços, duração e categorias
- **Financeiro** - Controle de transações, relatórios e faturamento com modais de confirmação
- **Marketing** - Campanhas e promoções
- **Avaliações** - Sistema de reviews e feedback dos clientes
- **Notificações** - Sistema de alertas em tempo real
- **Configurações** - Interface organizada em abas (Geral, Horários, Pagamentos, Notificações)
  - ✅ **Busca automática de CEP** - Integração com ViaCEP para preenchimento automático
  - ✅ **Copiar horários** - Copie o horário de segunda-feira para todos os dias

### 👥 Para Clientes
- **Agendamento Online** - Interface pública para agendamentos
- **Avaliação de Serviços** - Sistema de reviews pós-atendimento

### 🎨 Melhorias de UX/UI
- ✅ **Mensagens de erro amigáveis** - Tradução de erros técnicos para português
- ✅ **Micro-interações** - Animações sutis em cards e botões
- ✅ **Onboarding** - Checklist de configuração inicial no dashboard
- ✅ **Tags de especialidade** - Visualização da função do profissional em toda a interface
- ✅ **Modais de confirmação** - Proteção contra ações destrutivas acidentais
- ✅ **Responsividade** - Interface adaptável para diferentes tamanhos de tela

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Authentication - Autenticação
  - Storage - Armazenamento de arquivos
  - Realtime - Atualizações em tempo real
  - Row Level Security - Segurança de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)

## 🚀 Instalação Rápida

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd salon-flow
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais em **Settings > API**

### 4. Configure variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 5. Execute o schema do banco de dados

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute os scripts na seguinte ordem:
   - `supabase/schema.sql` - Schema completo do banco
   - `supabase/add_appointment_services_table.sql` - Tabela para múltiplos serviços por agendamento
3. Copie e cole o conteúdo de cada arquivo
4. Execute cada script separadamente

### 6. Configure Storage (opcional)

No Supabase, crie os buckets:
- `avatars` (público) - Para avatares de usuários
- `service-images` (público) - Para imagens de serviços

### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` (ou a porta indicada)

## 📚 Documentação Adicional

- **[Guia de Instalação Completo](./GUIA_INSTALACAO.md)** - Passo a passo detalhado
- **[Implementação Supabase](./IMPLEMENTACAO_SUPABASE.md)** - Arquitetura e detalhes técnicos
- **[Como Encontrar Credenciais Supabase](./COMO_ENCONTRAR_CREDENCIAIS_SUPABASE.md)** - Guia visual
- **[Resumo da Implementação](./RESUMO_IMPLEMENTACAO.md)** - Visão geral do projeto

## 📁 Estrutura do Projeto

```
salon-flow/
├── src/
│   ├── components/          # Componentes React
│   │   ├── admin/           # Componentes administrativos
│   │   ├── auth/            # Autenticação
│   │   ├── booking/         # Agendamento
│   │   ├── layout/          # Layouts (Header, Sidebar)
│   │   └── ui/              # Componentes UI (shadcn)
│   ├── contexts/            # Context API
│   │   ├── AuthContext.tsx  # Contexto de autenticação
│   │   ├── AppContext.tsx   # Contexto da aplicação
│   │   └── ThemeContext.tsx # Tema claro/escuro
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── supabase.ts     # Cliente Supabase
│   │   └── utils.ts        # Funções utilitárias
│   ├── pages/               # Páginas da aplicação
│   │   ├── admin/           # Páginas administrativas
│   │   ├── auth/            # Login, Registro, etc.
│   │   ├── booking/         # Agendamento público
│   │   └── review/          # Avaliações
│   └── services/            # Serviços de API
│       ├── auth.service.ts
│       ├── appointments.service.ts
│       ├── clients.service.ts
│       └── ...
├── supabase/                # Scripts SQL
│   ├── schema.sql           # Schema completo
│   ├── add_appointment_services_table.sql  # Tabela de relacionamento para múltiplos serviços
│   └── ...
└── public/                  # Arquivos estáticos
```

## 🎮 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento

# Qualidade
npm run lint         # Executa ESLint

# Preview
npm run preview      # Preview do build de produção
```

## 🔐 Segurança

O projeto utiliza **Row Level Security (RLS)** do Supabase para garantir:
- ✅ Isolamento de dados por tenant (multi-tenancy)
- ✅ Políticas de segurança configuradas
- ✅ Autenticação segura
- ✅ Proteção contra SQL injection
- ✅ Validação de conflitos de horário no frontend e backend

## 🎨 Tema e Design

O sistema suporta tema claro e escuro, com toggle disponível no header.

### Paleta de Cores Semânticas
- 🟢 **Verde** - Confirmado, Receita, Sucesso
- 🟡 **Amarelo** - Pendente, Atenção
- 🔵 **Azul** - Concluído, Informação
- 🔴 **Vermelho** - Cancelado, Despesa, Erro
- 🟣 **Roxo** - Primário, Neutro

### Componentes UI
- Cards com hover effects e micro-interações
- Modais com animações suaves
- Feedback visual em todas as ações
- Estados vazios (empty states) informativos

## 🚢 Deploy

### Deploy no Vercel/Netlify

1. Conecte seu repositório
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

### Build local

```bash
npm run build
```

Os arquivos estarão em `dist/`

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe
- Certifique-se que as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento

### Erro: "relation does not exist"
- Execute o schema SQL no Supabase
- Verifique se todas as tabelas foram criadas

### Erro de autenticação
- Verifique as políticas RLS no Supabase Dashboard
- Confirme que o RLS está habilitado nas tabelas

## 🆕 Atualizações Recentes

### v1.1.0 - Melhorias de UX e Funcionalidades
- ✨ **Múltiplos serviços por agendamento** - Agende vários serviços em uma única sessão
- ✨ **Validação de conflitos** - Sistema previne sobreposição de horários automaticamente
- ✨ **Cadastro rápido** - Crie clientes, profissionais e serviços sem sair do modal de agendamento
- 🎨 **Tags de especialidade** - Visualize a função do profissional em toda a interface
- 🎨 **Cards otimizados** - Agendamentos ocupam toda a área do horário para melhor visualização
- 🎨 **Cores semânticas** - Sistema de cores intuitivo para status e ações
- 🔧 **Mensagens amigáveis** - Erros traduzidos e contextualizados em português
- 🔧 **Onboarding** - Checklist de configuração inicial no dashboard
- 🔧 **Configurações organizadas** - Interface em abas para melhor navegação
- 🔧 **Busca automática de CEP** - Integração com ViaCEP para facilitar cadastro

### v1.0.0 - Lançamento Inicial
- Sistema completo de gestão para salões
- Dashboard administrativo
- Agenda com visualização diária/semanal
- Gestão de clientes, profissionais e serviços
- Sistema financeiro
- Marketing e avaliações

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Este é um projeto privado. Para sugestões ou problemas, abra uma issue no repositório.

---

Desenvolvido com ❤️ para salões de beleza modernos
