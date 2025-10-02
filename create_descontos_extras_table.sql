-- Script para criar tabela de descontos extras
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela descontos_extras
CREATE TABLE IF NOT EXISTS descontos_extras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_ano VARCHAR(7) NOT NULL, -- Formato: YYYY-MM (ex: 2025-01)
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índice para busca por mês/ano
CREATE INDEX IF NOT EXISTS idx_descontos_extras_mes_ano ON descontos_extras(mes_ano);

-- 3. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_descontos_extras_updated_at 
    BEFORE UPDATE ON descontos_extras 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Adicionar comentários para documentação
COMMENT ON TABLE descontos_extras IS 'Tabela para armazenar descontos extras por mês/ano';
COMMENT ON COLUMN descontos_extras.mes_ano IS 'Mês e ano no formato YYYY-MM (ex: 2025-01)';
COMMENT ON COLUMN descontos_extras.descricao IS 'Descrição do desconto extra';
COMMENT ON COLUMN descontos_extras.valor IS 'Valor do desconto em reais';

-- 5. Inserir dados de exemplo (opcional)
-- INSERT INTO descontos_extras (mes_ano, descricao, valor) VALUES 
-- ('2025-01', 'Multa por atraso', 50.00),
-- ('2025-01', 'Desconto por promoção', 30.00);

-- 6. Verificar se a tabela foi criada corretamente
SELECT * FROM descontos_extras LIMIT 5;
