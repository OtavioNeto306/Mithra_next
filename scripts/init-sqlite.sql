-- Criação da tabela para armazenar imagens dos produtos
CREATE TABLE IF NOT EXISTS produto_imagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codi_psv TEXT NOT NULL,
    url_imagem TEXT NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(codi_psv) -- Garantir que cada produto tenha apenas uma imagem
);

-- Índice para melhorar performance nas consultas por código do produto
CREATE INDEX IF NOT EXISTS idx_produto_imagens_codi_psv ON produto_imagens(codi_psv); 