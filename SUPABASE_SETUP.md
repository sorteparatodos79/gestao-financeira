# Configuração do Supabase - Sorte Ouro Verde

## 📋 Passos para conectar o banco de dados

### 1. Instalar dependências
```bash
npm install @supabase/supabase-js
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://wtvaamhssndvhlxmxjok.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA
```

### 3. Executar o schema SQL
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o projeto `wtvaamhssndvhlxmxjok`
3. Clique em **SQL Editor**
4. Cole o conteúdo do arquivo `supabase_schema.sql`
5. Clique em **Run** para executar

### 4. Verificar tabelas criadas
No Supabase Dashboard, vá para **Table Editor** e verifique se as seguintes tabelas foram criadas:

- ✅ `usuarios`
- ✅ `setoristas`
- ✅ `despesas`
- ✅ `despesas_fixas`
- ✅ `movimentos_financeiros`
- ✅ `investimentos`
- ✅ `extra_discounts`

### 5. Configurar autenticação (opcional)
Se quiser usar autenticação do Supabase:

1. Vá para **Authentication** > **Settings**
2. Configure **Site URL**: `http://localhost:5173`
3. Configure **Redirect URLs**: `http://localhost:5173/**`

## 🗄️ Estrutura do banco

### Tabelas principais:
- **usuarios**: Usuários do sistema (admin/user)
- **setoristas**: Setoristas/vendedores
- **despesas**: Despesas do sistema
- **despesas_fixas**: Despesas fixas por setorista
- **movimentos_financeiros**: Vendas, comissões, prêmios
- **investimentos**: Investimentos do sistema
- **extra_discounts**: Descontos extras disponíveis

### Características:
- ✅ **UUIDs** como chaves primárias
- ✅ **Timestamps** automáticos (created_at, updated_at)
- ✅ **Índices** para performance
- ✅ **RLS** (Row Level Security) habilitado
- ✅ **Triggers** para updated_at
- ✅ **Views** para relatórios
- ✅ **Dados iniciais** incluídos

## 🔐 Segurança

O schema inclui:
- **Row Level Security (RLS)** em todas as tabelas
- **Políticas de acesso** baseadas em roles
- **Validações** de dados com CHECK constraints
- **Soft delete** para setoristas e usuários

## 📊 Views disponíveis

- `relatorio_despesas_setorista`: Despesas agrupadas por setorista
- `relatorio_movimentos_setorista`: Movimentos financeiros por setorista
- `relatorio_investimentos_tipo`: Investimentos agrupados por tipo

## 🚀 Próximos passos

1. Execute o schema SQL
2. Teste a conexão com o banco
3. Substitua o `storageService.ts` pelo `supabaseService.ts`
4. Atualize os componentes para usar as novas funções
5. Teste todas as funcionalidades

## 📝 Notas importantes

- O usuário administrador padrão é criado automaticamente
- A senha padrão é `password` (hash bcrypt)
- Todos os setoristas e usuários têm soft delete (campo `ativo`)
- As datas são armazenadas como DATE no banco
- Os valores monetários usam DECIMAL(10,2) para precisão
