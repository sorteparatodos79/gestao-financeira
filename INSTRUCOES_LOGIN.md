# 🔧 Instruções para Corrigir o Login

## ✅ **Problemas Identificados e Corrigidos:**

1. **Estrutura da tabela `usuarios`** - Removido campo `email`, adicionado campo `login`
2. **Código TypeScript** - Atualizado para nova estrutura
3. **Sistema de autenticação** - Ajustado para usar campo `login`
4. **Logs de debug** - Adicionados para facilitar diagnóstico

## 🚀 **Passos para Resolver:**

### **1. Criar arquivo `.env.local`** (OBRIGATÓRIO)
Crie o arquivo `.env.local` na raiz do projeto com:
```env
VITE_SUPABASE_URL=https://wtvaamhssndvhlxmxjok.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA
```

### **2. Executar Script SQL no Supabase**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o projeto `wtvaamhssndvhlxmxjok`
3. Clique em **SQL Editor**
4. Execute o arquivo `update_usuarios_table.sql` (para modificar a tabela)
5. Execute o arquivo `create_test_user.sql` (para criar usuário de teste)

### **3. Reiniciar o Servidor**
```bash
npm run dev
```

### **4. Testar o Login**
Use estas credenciais:
- **Login:** `admin`
- **Senha:** `password`

## 🔍 **Nova Estrutura da Tabela `usuarios`:**

```sql
CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  login varchar(255) NOT NULL UNIQUE,
  senha varchar(255) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('admin', 'user')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

## 🐛 **Debug:**
Abra o console do navegador (F12) para ver logs detalhados:
- ✅ Conexão com banco
- 📊 Quantidade de usuários encontrados
- 🔍 Detalhes de cada verificação de credenciais
- ❌ Erros específicos

## 📋 **Arquivos Modificados:**
- `src/hooks/use-auth.tsx` - Sistema de autenticação
- `src/services/supabaseService.ts` - Tipos TypeScript
- `src/types/models.ts` - Modelo Usuario
- `create_test_user.sql` - Script de usuário de teste
- `update_usuarios_table.sql` - Script de modificação da tabela

## 🎯 **Resultado Esperado:**
Após executar todos os passos, o login deve funcionar com:
- **Login:** `admin`
- **Senha:** `password`

Se ainda houver problemas, verifique os logs no console do navegador!
