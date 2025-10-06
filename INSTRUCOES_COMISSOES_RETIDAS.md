# 📋 Instruções para Implementar Comissões Retidas

## 🗄️ **Passo 1: Executar Script SQL**

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"

3. **Execute o Script**
   - Copie e cole o conteúdo do arquivo `create_comissoes_retidas_table.sql`
   - Clique em "Run" para executar

4. **Verificar se funcionou**
   - Você deve ver uma mensagem de sucesso
   - A tabela `comissoes_retidas` deve ter sido criada

## 🔧 **Passo 2: Testar a Funcionalidade**

1. **Acesse o Menu**
   - No sidebar, clique em "Comissões Retidas"
   - Você deve ver a nova página

2. **Cadastrar Nova Comissão Retida**
   - Clique em "Nova Comissão Retida"
   - Preencha os campos: Data, Setorista, Valor e Descrição
   - Clique em "Salvar"

3. **Verificar Funcionalidades**
   - Listar comissões retidas
   - Editar comissão existente
   - Excluir comissão retida
   - Ver estatísticas no dashboard

## 📊 **Estrutura da Nova Tabela**

```sql
comissoes_retidas:
├── id (UUID) - Chave primária
├── data (DATE) - Data da comissão retida
├── setorista_id (UUID) - Referência ao setorista
├── valor (DECIMAL) - Valor em reais
├── descricao (TEXT) - Descrição opcional
├── created_at (TIMESTAMP) - Data de criação
└── updated_at (TIMESTAMP) - Data de atualização
```

## ✅ **Funcionalidades Implementadas**

- ✅ **CRUD Completo**: Criar, ler, atualizar e deletar comissões retidas
- ✅ **Validação**: Formulário com validação usando Zod
- ✅ **Interface Moderna**: Design consistente com o resto do sistema
- ✅ **Relacionamentos**: Vinculação com setoristas
- ✅ **Estatísticas**: Cards com resumos na listagem
- ✅ **Navegação**: Menu item no sidebar
- ✅ **Responsivo**: Funciona em mobile e desktop
- ✅ **Feedback**: Mensagens de sucesso/erro
- ✅ **Segurança**: RLS habilitado no Supabase

## 🎯 **Como Funciona**

1. **Listagem**: Mostra todas as comissões retidas com estatísticas
2. **Cadastro**: Formulário simples com validação
3. **Edição**: Mesmo formulário para editar registros existentes
4. **Exclusão**: Confirmação antes de excluir
5. **Navegação**: Integrado ao menu principal

## 🚀 **Próximos Passos**

Após executar o script SQL, a funcionalidade estará completamente operacional!

- As comissões retidas agora têm **seu próprio módulo**
- **Separação clara** dos movimentos financeiros
- **Controle específico** para este tipo de lançamento
- **Relatórios futuros** podem incluir esta informação

## 📝 **Notas Importantes**

- O campo `comissaoRetida` foi removido do formulário de movimentos
- Agora existe uma tela específica para gerenciar comissões retidas
- A funcionalidade está totalmente integrada ao sistema existente
- Mantém a mesma arquitetura e padrões de código
