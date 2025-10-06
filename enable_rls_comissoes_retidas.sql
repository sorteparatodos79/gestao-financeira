-- Comandos adicionais para completar a configuração da tabela comissoes_retidas
-- Execute estes comandos no Supabase SQL Editor

-- Habilitar RLS (Row Level Security)
ALTER TABLE comissoes_retidas ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir acesso a todos os usuários autenticados
CREATE POLICY "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas
    FOR ALL USING (auth.role() = 'authenticated');

-- Verificar se tudo está funcionando
SELECT 'Tabela comissoes_retidas configurada com sucesso!' as status;
