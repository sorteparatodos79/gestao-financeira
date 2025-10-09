# 🔧 Solução para Erro 401 na Tela de Vales

## Problema Identificado
O erro 401 (não autorizado) indica que:
1. **A tabela `vales` não existe** no banco de dados, OU
2. **As políticas RLS estão mal configuradas**, OU  
3. **Há problemas de permissão** no Supabase

## Solução Passo a Passo

### 1. 🗄️ Criar a Tabela no Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione o projeto correto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script Principal**
   - Copie todo o conteúdo do arquivo `create_vales_table.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Execute o Script de Verificação**
   - Copie todo o conteúdo do arquivo `fix_vales_permissions.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

### 2. 🔍 Verificar se Funcionou

Após executar os scripts, verifique:

1. **Tabela criada**: Vá para "Table Editor" e procure pela tabela `vales`
2. **Políticas configuradas**: Vá para "Authentication" > "Policies" e verifique se há políticas para `vales`
3. **Teste no sistema**: Tente criar um novo vale

### 3. 🚨 Se Ainda Houver Problemas

Se o erro 401 persistir, execute este script adicional:

```sql
-- Script de emergência para corrigir permissões
-- Execute APENAS se os scripts anteriores não funcionaram

-- Desabilitar RLS temporariamente para teste
ALTER TABLE vales DISABLE ROW LEVEL SECURITY;

-- Testar inserção sem RLS
INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
VALUES (
  CURRENT_DATE,
  (SELECT id FROM setoristas LIMIT 1),
  'Adiantamento',
  100.00,
  'Teste sem RLS',
  'Pendente'
);

-- Se funcionou, reabilitar RLS com política mais simples
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- Política mais permissiva
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir SELECT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir INSERT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir UPDATE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir DELETE em vales para usuários autenticados" ON vales;

CREATE POLICY "Acesso total a vales" ON vales
  FOR ALL USING (true);

-- Limpar teste
DELETE FROM vales WHERE descricao = 'Teste sem RLS';
```

### 4. 📋 Checklist de Verificação

- [ ] Script `create_vales_table.sql` executado com sucesso
- [ ] Script `fix_vales_permissions.sql` executado com sucesso  
- [ ] Tabela `vales` aparece no Table Editor
- [ ] Políticas RLS configuradas corretamente
- [ ] Teste de criação de vale funcionando
- [ ] Sem erros 401 no console do navegador

### 5. 🔄 Teste Final

Após executar os scripts:

1. **Recarregue a página** de vales no sistema
2. **Tente criar um novo vale**
3. **Verifique se não há mais erros 401**
4. **Teste editar e excluir** um vale existente

## Arquivos Criados

- ✅ `create_vales_table.sql` - Script principal para criar a tabela
- ✅ `fix_vales_permissions.sql` - Script para verificar e corrigir permissões
- ✅ `INSTRUCOES_VALES.md` - Instruções detalhadas

## Status Atual

- ✅ Código da tela de vales ajustado
- ✅ Rotas configuradas corretamente
- ⚠️ **PENDENTE**: Executar scripts SQL no Supabase

Após executar os scripts SQL, a funcionalidade de vales deve funcionar perfeitamente!
