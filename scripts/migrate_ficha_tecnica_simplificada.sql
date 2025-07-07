-- Script para simplificar a tabela produto_ficha_tecnica
-- Mantendo apenas os campos: especificacoes_tecnicas e observacoes

-- 1. Criar nova tabela temporária com estrutura simplificada
CREATE TABLE IF NOT EXISTS produto_ficha_tecnica_novo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codi_psv TEXT NOT NULL,
    especificacoes_tecnicas TEXT,
    observacoes TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(codi_psv)
);

-- 2. Migrar dados existentes (apenas os campos que queremos manter)
INSERT INTO produto_ficha_tecnica_novo (codi_psv, especificacoes_tecnicas, observacoes, data_cadastro, data_atualizacao)
SELECT codi_psv, especificacoes_tecnicas, observacoes, data_cadastro, data_atualizacao
FROM produto_ficha_tecnica;

-- 3. Remover tabela antiga
DROP TABLE produto_ficha_tecnica;

-- 4. Renomear tabela nova para o nome original
ALTER TABLE produto_ficha_tecnica_novo RENAME TO produto_ficha_tecnica;

-- 5. Recriar índice para performance
CREATE INDEX IF NOT EXISTS idx_produto_ficha_tecnica_codi_psv ON produto_ficha_tecnica(codi_psv);

-- 6. Recriar trigger para atualização automática de timestamps
CREATE TRIGGER IF NOT EXISTS update_ficha_tecnica_timestamp 
    AFTER UPDATE ON produto_ficha_tecnica
    FOR EACH ROW
BEGIN
    UPDATE produto_ficha_tecnica 
    SET data_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END; 