# 🚀 Guia de Instalação e Configuração - Salon Flow com Supabase

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- npm ou yarn

## 🔧 Passo a Passo

### 1. Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > API** e copie:
   - **Project URL**
   - **anon/public key**

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Executar Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase/schema.sql`
3. Copie e cole todo o conteúdo no editor
4. Clique em **Run** para executar

### 5. Configurar Storage (Opcional - para avatares e imagens)

1. No Supabase, vá em **Storage**
2. Crie um bucket chamado `avatars` (público)
3. Crie um bucket chamado `service-images` (público)

### 6. Testar Instalação

```bash
npm run dev
```

Acesse `http://localhost:8080` e teste o registro de um novo salão.

---

## 📁 Estrutura de Arquivos Criados

```
salon-flow/
├── IMPLEMENTACAO_SUPABASE.md    # Documento completo de arquitetura
├── GUIA_INSTALACAO.md            # Este arquivo
├── supabase/
│   └── schema.sql                # Schema completo do banco
├── src/
│   ├── lib/
│   │   └── supabase.ts           # Cliente Supabase
│   ├── services/
│   │   ├── auth.service.ts       # Serviço de autenticação
│   │   └── professionals.service.ts  # Exemplo de serviço CRUD
│   └── hooks/
│       └── useAuth.ts            # Hook de autenticação
```

---

## 🔐 Segurança

O schema SQL já inclui:
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de segurança configuradas
- ✅ Isolamento de dados por tenant

**Importante**: Revise as políticas RLS no Supabase Dashboard para garantir que atendem suas necessidades.

---

## 📝 Próximos Passos

1. ✅ Instalar dependências
2. ✅ Configurar Supabase
3. ✅ Executar schema SQL
4. ⏳ Criar serviços restantes (services, clients, appointments, etc.)
5. ⏳ Criar hooks correspondentes
6. ⏳ Atualizar componentes para usar os novos serviços
7. ⏳ Implementar real-time para notificações
8. ⏳ Testar todas as funcionalidades

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe na raiz
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento

### Erro: "relation does not exist"
- Execute o schema SQL no Supabase
- Verifique se todas as tabelas foram criadas

### Erro de autenticação
- Verifique se o RLS está configurado corretamente
- Verifique as políticas de segurança no Supabase Dashboard

---

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 💡 Dicas

1. Use o **Supabase Dashboard** para visualizar dados em tempo real
2. Use o **SQL Editor** para fazer queries de teste
3. Configure **backups automáticos** no Supabase
4. Use **Supabase Realtime** para notificações em tempo real
5. Considere usar **Edge Functions** para lógica complexa

---

Boa sorte com a implementação! 🎉





