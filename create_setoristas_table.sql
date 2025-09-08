-- Script para criar a tabela setoristas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela setoristas
CREATE TABLE IF NOT EXISTS public.setoristas (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    CONSTRAINT setoristas_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_setoristas_nome ON public.setoristas USING btree (nome) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_setoristas_ativo ON public.setoristas USING btree (ativo) TABLESPACE pg_default;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_setoristas_updated_at 
    BEFORE UPDATE ON setoristas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns setoristas de exemplo
INSERT INTO public.setoristas (nome, telefone, ativo) VALUES
('João Silva', '(11) 99999-9999', true),
('Maria Santos', '(11) 88888-8888', true),
('Pedro Oliveira', '(11) 77777-7777', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT * FROM public.setoristas ORDER BY nome;
