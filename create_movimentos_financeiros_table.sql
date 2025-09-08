-- Script para criar a tabela movimentos_financeiros no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela movimentos_financeiros
CREATE TABLE IF NOT EXISTS public.movimentos_financeiros (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    data DATE NOT NULL,
    setorista_id UUID NOT NULL,
    vendas DECIMAL(10,2) NOT NULL DEFAULT 0,
    comissao DECIMAL(10,2) NOT NULL DEFAULT 0,
    comissao_retida DECIMAL(10,2) NOT NULL DEFAULT 0,
    premios DECIMAL(10,2) NOT NULL DEFAULT 0,
    despesas DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_liquido DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    CONSTRAINT movimentos_financeiros_pkey PRIMARY KEY (id),
    CONSTRAINT movimentos_financeiros_setorista_id_fkey FOREIGN KEY (setorista_id) 
        REFERENCES public.setoristas(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_data ON public.movimentos_financeiros USING btree (data) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_setorista_id ON public.movimentos_financeiros USING btree (setorista_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_valor_liquido ON public.movimentos_financeiros USING btree (valor_liquido) TABLESPACE pg_default;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_movimentos_financeiros_updated_at 
    BEFORE UPDATE ON movimentos_financeiros 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar RLS na tabela movimentos_financeiros
ALTER TABLE public.movimentos_financeiros DISABLE ROW LEVEL SECURITY;

-- Inserir alguns movimentos de exemplo (opcional)
INSERT INTO public.movimentos_financeiros (data, setorista_id, vendas, comissao, comissao_retida, premios, despesas, valor_liquido) 
SELECT 
    CURRENT_DATE - INTERVAL '1 day' * (random() * 30)::int,
    s.id,
    (random() * 10000 + 1000)::decimal(10,2),
    (random() * 1000 + 100)::decimal(10,2),
    (random() * 200 + 50)::decimal(10,2),
    (random() * 500 + 50)::decimal(10,2),
    0,
    (random() * 8000 + 500)::decimal(10,2)
FROM public.setoristas s
LIMIT 3
ON CONFLICT (id) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 
    m.id,
    m.data,
    s.nome as setorista_nome,
    m.vendas,
    m.comissao,
    m.comissao_retida,
    m.premios,
    m.despesas,
    m.valor_liquido
FROM public.movimentos_financeiros m
JOIN public.setoristas s ON m.setorista_id = s.id
ORDER BY m.data DESC;
