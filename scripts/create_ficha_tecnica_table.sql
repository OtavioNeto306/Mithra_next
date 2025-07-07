-- Criação da tabela para armazenar fichas técnicas dos produtos
CREATE TABLE IF NOT EXISTS produto_ficha_tecnica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codi_psv TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    peso DECIMAL(10,3),
    dimensoes TEXT,
    cor TEXT,
    material TEXT,
    caracteristicas TEXT,
    especificacoes_tecnicas TEXT,
    observacoes TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(codi_psv) -- Garantir que cada produto tenha apenas uma ficha técnica
);

-- Índice para melhorar performance nas consultas por código do produto
CREATE INDEX IF NOT EXISTS idx_produto_ficha_tecnica_codi_psv ON produto_ficha_tecnica(codi_psv);

-- Trigger para atualizar data_atualizacao automaticamente
CREATE TRIGGER IF NOT EXISTS update_ficha_tecnica_timestamp 
    AFTER UPDATE ON produto_ficha_tecnica
    FOR EACH ROW
BEGIN
    UPDATE produto_ficha_tecnica 
    SET data_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END; 