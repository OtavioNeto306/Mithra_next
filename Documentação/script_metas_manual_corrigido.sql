-- Script para criação da tabela de metas de vendedores (CORRIGIDO)
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
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- Trigger para validar unicidade (substitui a constraint UNIQUE complexa)
CREATE TRIGGER IF NOT EXISTS check_metas_vendedores_unique
    BEFORE INSERT ON metas_vendedores
    FOR EACH ROW
BEGIN
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM metas_vendedores 
            WHERE codigo_vendedor = NEW.codigo_vendedor
            AND ano = NEW.ano
            AND mes = NEW.mes
            AND tipo_meta = NEW.tipo_meta
            AND (
                (NEW.tipo_meta = 'fornecedor' AND codigo_fornecedor = NEW.codigo_fornecedor)
                OR (NEW.tipo_meta = 'produto' AND codigo_produto = NEW.codigo_produto)
            )
        )
        THEN RAISE(ABORT, 'Meta já existe para este vendedor, período e tipo')
    END;
END;

-- Trigger para validar unicidade em atualizações
CREATE TRIGGER IF NOT EXISTS check_metas_vendedores_unique_update
    BEFORE UPDATE ON metas_vendedores
    FOR EACH ROW
BEGIN
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM metas_vendedores 
            WHERE id != NEW.id
            AND codigo_vendedor = NEW.codigo_vendedor
            AND ano = NEW.ano
            AND mes = NEW.mes
            AND tipo_meta = NEW.tipo_meta
            AND (
                (NEW.tipo_meta = 'fornecedor' AND codigo_fornecedor = NEW.codigo_fornecedor)
                OR (NEW.tipo_meta = 'produto' AND codigo_produto = NEW.codigo_produto)
            )
        )
        THEN RAISE(ABORT, 'Meta já existe para este vendedor, período e tipo')
    END;
END;

-- Verificar se a tabela foi criada corretamente
SELECT name FROM sqlite_master WHERE type='table' AND name='metas_vendedores';

-- Mostrar estrutura da tabela
PRAGMA table_info(metas_vendedores);

-- Mostrar triggers criados
SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE '%metas_vendedores%';

-- Inserir alguns dados de exemplo (opcional - descomente se quiser testar)
-- INSERT INTO metas_vendedores (codigo_vendedor, ano, mes, tipo_meta, codigo_fornecedor, valor_meta, observacoes) 
-- VALUES ('V001', 2024, 12, 'fornecedor', 'FORN001', 50000.00, 'Meta mensal para fornecedor');

-- INSERT INTO metas_vendedores (codigo_vendedor, ano, mes, tipo_meta, codigo_produto, valor_meta, observacoes) 
-- VALUES ('V002', 2024, 12, 'produto', 'PROD001', 25000.00, 'Meta mensal para produto específico');

-- Verificar dados inseridos (se houver)
-- SELECT * FROM metas_vendedores; 