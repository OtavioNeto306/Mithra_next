# Gerenciamento de Produtos e Imagens

## Funcionalidades

Esta página permite:
- Listar produtos da tabela PRODSERV do Oracle
- Pesquisar produtos por código ou descrição
- Adicionar URLs de imagens para produtos
- Visualizar imagens já cadastradas

## Como usar

### 1. Acessar a página
Navegue para `/produtos` no sistema.

### 2. Pesquisar produtos
- Use o campo de busca para filtrar por código ou descrição
- A busca é feita em tempo real na base Oracle
- Use a paginação para navegar pelos resultados (50 produtos por página)

### 3. Adicionar/Alterar imagem
1. Clique no botão "Adicionar Imagem" ou "Alterar Imagem" na linha do produto
2. Cole a URL da imagem no campo
3. Veja a pré-visualização da imagem
4. Clique em "Salvar" para confirmar

### 4. Visualizar imagens
- Produtos com imagem mostram uma miniatura na coluna "Imagem"
- Produtos sem imagem mostram o ícone "Sem imagem"

## Estrutura dos dados

### Tabela Oracle (PRODSERV)
- `CODI_PSV`: Código do produto
- `DESC_PSV`: Descrição do produto
- `PRSE_PSV`: Tipo (P = Produto)
- `SITU_PSV`: Situação (A = Ativo)

### Tabela SQLite (produto_imagens)
- `id`: Chave primária
- `codi_psv`: Código do produto (vinculado ao Oracle)
- `url_imagem`: URL da imagem
- `data_cadastro`: Data/hora do cadastro

## APIs disponíveis

### GET /api/produtos
Lista produtos com paginação e busca.

Parâmetros:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 50)
- `busca`: Texto para buscar no código ou descrição

### POST /api/produtos/imagem
Salva URL de imagem para um produto.

Body:
```json
{
  "codi_psv": "123",
  "url_imagem": "https://exemplo.com/imagem.jpg"
}
```

### GET /api/produtos/imagem
Busca imagens de um produto específico.

Parâmetros:
- `codi_psv`: Código do produto

### POST /api/init-sqlite
Inicializa a tabela produto_imagens no SQLite (executar uma vez).

## Observações técnicas

- As imagens são armazenadas apenas como URLs, não arquivos
- Cada produto pode ter apenas uma imagem (UNIQUE constraint)
- A busca no Oracle usa LIKE com % para busca parcial
- A paginação usa ROW_NUMBER() para performance
- O SQLite é usado para persistir as URLs das imagens
- As imagens são carregadas externamente via URL 