# Instruções para Criar a Tabela de Vales

## Problema Identificado
A página de vales estava dando erro 404 porque:
1. **Faltava a rota `/vales`** no arquivo `App.tsx` - ✅ **CORRIGIDO**
2. **A tabela `vales` não existe no banco de dados** - ⚠️ **PRECISA SER CRIADA**

## Solução

### 1. Executar o Script SQL
Para criar a tabela de vales no banco de dados Supabase:

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione o projeto correto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `create_vales_table.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

### 2. Verificar se a Tabela foi Criada
Após executar o script, verifique se a tabela foi criada:
- Vá para "Table Editor" no menu lateral
- Procure pela tabela `vales`
- Verifique se todas as colunas estão presentes

### 3. Estrutura da Tabela
A tabela `vales` terá as seguintes colunas:
- `id` (UUID, Primary Key)
- `data` (DATE, obrigatório)
- `setorista_id` (UUID, referência para setoristas)
- `tipo_vale` (TEXT, com valores: Adiantamento, Comissão, Prêmio, Despesa, Outros)
- `valor` (DECIMAL, obrigatório e maior que 0)
- `descricao` (TEXT, opcional)
- `status` (TEXT, padrão: Pendente, valores: Pendente, Recebido, Cancelado)
- `data_recebimento` (DATE, opcional)
- `observacoes` (TEXT, opcional)
- `created_at` (TIMESTAMP, automático)
- `updated_at` (TIMESTAMP, automático)

### 4. Funcionalidades Incluídas
- ✅ **RLS (Row Level Security)** habilitado
- ✅ **Índices** para melhor performance
- ✅ **Triggers** para atualização automática de timestamps
- ✅ **Constraints** para validação de dados
- ✅ **Políticas de segurança** para usuários autenticados

### 5. Testar a Funcionalidade
Após criar a tabela:
1. Acesse a página `/vales` no sistema
2. Teste criar um novo vale
3. Teste editar um vale existente
4. Teste excluir um vale
5. Verifique se os dados estão sendo salvos corretamente

## Status das Correções
- ✅ Rota `/vales` adicionada ao App.tsx
- ✅ Rota `/relatorios` corrigida
- ✅ Import do RelatoriosPage adicionado
- ⚠️ **PENDENTE**: Executar script SQL no Supabase

Após executar o script SQL, a página de vales deve funcionar perfeitamente!