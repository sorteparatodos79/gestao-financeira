-- Script alternativo para políticas RLS mais permissivas
-- Execute APENAS se o script anterior não funcionar

-- 1. Desabilitar RLS temporariamente para teste
ALTER TABLE vales DISABLE ROW LEVEL SECURITY;

-- 2. Testar inserção sem RLS
INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
VALUES (
  CURRENT_DATE,
  (SELECT id FROM setoristas LIMIT 1),
  'Adiantamento',
  100.00,
  'Teste sem RLS',
  'Pendente'
);

-- 3. Se funcionou, reabilitar RLS com política mais simples
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- 4. Política mais permissiva (para desenvolvimento)
CREATE POLICY "Acesso total a vales para desenvolvimento" ON vales
  FOR ALL USING (true);

-- 5. Verificar se funcionou
SELECT 'RLS configurado com política permissiva' as status;

-- 6. Testar novamente
INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
VALUES (
  CURRENT_DATE,
  (SELECT id FROM setoristas LIMIT 1),
  'Adiantamento',
  200.00,
  'Teste com RLS permissivo',
  'Pendente'
);

-- 7. Verificar inserção
SELECT * FROM vales WHERE descricao LIKE 'Teste%';

-- 8. Limpar testes
DELETE FROM vales WHERE descricao LIKE 'Teste%';
SELECT 'Testes removidos' as status;
