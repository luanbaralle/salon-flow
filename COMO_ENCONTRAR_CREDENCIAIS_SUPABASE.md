# 🔑 Como Encontrar URL e Chave Anon no Supabase

## 📍 Passo a Passo Detalhado

### 1. Acesse o Dashboard do Supabase

1. Vá para [https://app.supabase.com](https://app.supabase.com)
2. Faça login na sua conta

### 2. Selecione ou Crie um Projeto

- Se já tem um projeto: clique nele
- Se não tem: clique em **"New Project"** e crie um novo

### 3. Encontre as Credenciais

#### Opção 1: Pela Barra Lateral (Mais Fácil)

1. No menu lateral esquerdo, procure por **"Settings"** (Configurações)
   - Ícone de engrenagem ⚙️
2. Clique em **"Settings"**
3. No submenu que aparece, clique em **"API"**
4. Você verá duas seções importantes:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - Copie essa URL completa

   **Project API keys:**
   - Procure por **"anon"** ou **"public"** key
   - É uma string longa que começa com algo como: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Clique no ícone de **olho** 👁️ para revelar a chave
   - Clique no ícone de **cópia** 📋 para copiar

#### Opção 2: Pela URL Direta

Se você já está no projeto, a URL direta é:
```
https://app.supabase.com/project/[SEU-PROJECT-ID]/settings/api
```

### 4. Onde Está Cada Coisa na Tela

```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
├─────────────────────────────────────────┤
│                                         │
│  [Menu Lateral]                         │
│  ├─ Table Editor                        │
│  ├─ SQL Editor                          │
│  ├─ Authentication                      │
│  ├─ Storage                             │
│  └─ ⚙️ Settings  ← CLIQUE AQUI          │
│     ├─ General                          │
│     ├─ API          ← DEPOIS AQUI       │
│     ├─ Database                         │
│     └─ ...                              │
│                                         │
└─────────────────────────────────────────┘
```

### 5. Na Página de API, Você Verá:

```
┌─────────────────────────────────────────┐
│  API Settings                           │
├─────────────────────────────────────────┤
│                                         │
│  Project URL                            │
│  ┌───────────────────────────────────┐ │
│  │ https://xxxxx.supabase.co         │ │ ← COPIE ISSO
│  └───────────────────────────────────┘ │
│                                         │
│  Project API keys                       │
│                                         │
│  anon / public                          │
│  ┌───────────────────────────────────┐ │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6...  │ │ ← COPIE ISSO
│  └───────────────────────────────────┘ │
│  [👁️] [📋]                              │
│                                         │
│  service_role (secret)                  │
│  ┌───────────────────────────────────┐ │
│  │ (não use essa no frontend!)       │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## ⚠️ Importante

- Use a chave **"anon"** ou **"public"** (não a service_role)
- A chave anon é segura para usar no frontend
- Nunca exponha a chave service_role no frontend

## 📝 Exemplo de Arquivo .env

Depois de copiar, crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzY5MzIwLCJleHAiOjE5NTczNDUzMjB9.sua-chave-completa-aqui
```

## 🆘 Ainda Não Encontrou?

### Alternativa: Verificar no Código de Inicialização

1. No Supabase Dashboard, vá em **"Authentication"**
2. Clique em **"Getting Started"** ou **"Quick Start"**
3. Lá você verá exemplos de código com as credenciais

### Ou Procure por:

- **"Project Settings"**
- **"API Configuration"**
- **"Credentials"**
- **"Keys"**

## 📸 Se Precisar de Ajuda Visual

Se ainda tiver dificuldade, me diga:
- Qual página você está vendo agora?
- O que aparece no menu lateral?
- Você já criou o projeto?

Posso te guiar passo a passo! 😊




