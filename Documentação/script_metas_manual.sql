-- Script para criação da tabela de metas de vendedores
-- Execute este script manualmente no SQLite para criar a tabela

-- Criação da tabela para armazenar metas mensais dos vendedores
CREATE TABLE IF NOT EXISTS metas_vendedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_vendedor TEXT NOT NULL,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    tipo_meta TEXT NOT NULL CHECK (tipo_meta IN ('fornecedor', 'produto')),
    codigo_fornecedor TEXT,
    codigo_produto TEXT,
    valor_meta DECIMAL(15,2) NOT NULL,
    observacoes TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(codigo_vendedor, ano, mes, tipo_meta, COALESCE(codigo_fornecedor, ''), COALESCE(codigo_produto, ''))
);

-- Índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_metas_vendedores_codigo_vendedor ON metas_vendedores(codigo_vendedor);
CREATE INDEX IF NOT EXISTS idx_metas_vendedores_ano_mes ON metas_vendedores(ano, mes);
CREATE INDEX IF NOT EXISTS idx_metas_vendedores_tipo_meta ON metas_vendedores(tipo_meta);
CREATE INDEX IF NOT EXISTS idx_metas_vendedores_fornecedor ON metas_vendedores(codigo_fornecedor);
CREATE INDEX IF NOT EXISTS idx_metas_vendedores_produto ON metas_vendedores(codigo_produto);

-- Trigger para atualizar automaticamente a data_atualizacao
CREATE TRIGGER IF NOT EXISTS update_metas_vendedores_timestamp 
    AFTER UPDATE ON metas_vendedores
    FOR EACH ROW
BEGIN
    UPDATE metas_vendedores 
    SET data_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Verificar se a tabela foi criada corretamente
SELECT name FROM sqlite_master WHERE type='table' AND name='metas_vendedores';

-- Mostrar estrutura da tabela
PRAGMA table_info(metas_vendedores);

-- Inserir alguns dados de exemplo (opcional)
-- INSERT INTO metas_vendedores (codigo_vendedor, ano, mes, tipo_meta, codigo_fornecedor, valor_meta, observacoes) 
-- VALUES ('V001', 2024, 12, 'fornecedor', 'FORN001', 50000.00, 'Meta mensal para fornecedor');

-- INSERT INTO metas_vendedores (codigo_vendedor, ano, mes, tipo_meta, codigo_produto, valor_meta, observacoes) 
-- VALUES ('V002', 2024, 12, 'produto', 'PROD001', 25000.00, 'Meta mensal para produto específico');

-- Verificar dados inseridos (se houver)
-- SELECT * FROM metas_vendedores; 