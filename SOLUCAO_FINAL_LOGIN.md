# 🔧 Solução Final para o Login

## 🎯 **Problema Identificado:**
O usuário `admin` existe na tabela `usuarios` no Supabase, mas a aplicação não consegue acessá-lo devido ao **RLS (Row Level Security)** habilitado na tabela.

## ✅ **Solução:**

### **1. Execute o Script SQL no Supabase Dashboard**

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá para o projeto `wtvaamhssndvhlxmxjok`
3. Clique em **SQL Editor**
4. Execute o conteúdo do arquivo `disable_rls_simple.sql`:

```sql
-- Desabilitar RLS na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT 'RLS desabilitado. Dados da tabela:' as info;
SELECT id, nome, login, role, ativo FROM usuarios;
```

### **2. Teste o Login**

Após executar o script:
1. Acesse http://localhost:8082/
2. Use as credenciais:
   - **Login:** `admin`
   - **Senha:** `password`

### **3. Verificar se Funcionou**

Abra o console do navegador (F12) e verifique se aparece:
- ✅ `📊 Usuários encontrados: 1`
- ✅ `👥 Lista de usuários: [objeto com dados do admin]`
- ✅ `✅ Usuário encontrado: [dados do usuário]`

## 🔍 **O que estava acontecendo:**

1. **Tabela `usuarios`** existe e tem o usuário admin
2. **RLS habilitado** bloqueava o acesso aos dados
3. **Aplicação** não conseguia ler os dados devido às políticas de segurança
4. **Script SQL** desabilita o RLS temporariamente para resolver o problema

## 🚀 **Resultado Esperado:**

Após executar o script, o login deve funcionar perfeitamente com:
- **Login:** `admin`
- **Senha:** `password`

**Execute o script `disable_rls_simple.sql` no Supabase Dashboard e teste o login!**
