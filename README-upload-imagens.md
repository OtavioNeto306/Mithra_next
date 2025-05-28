# Upload de Imagens para Produtos

## Funcionalidade Implementada

O sistema agora permite fazer upload de imagens para produtos de duas formas:

### 1. Upload de Arquivo
- **Localização**: As imagens são salvas na pasta `public/img/`
- **Nomenclatura**: O arquivo é renomeado com o código do produto + extensão original
  - Exemplo: Produto com código "ABC123" → arquivo salvo como "ABC123.jpg"
- **Formatos aceitos**: JPG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB por arquivo
- **Validações**: 
  - Verifica se é um arquivo de imagem
  - Verifica o tamanho do arquivo
  - Substitui imagem existente se já houver uma para o produto

### 2. URL Externa
- Permite inserir URL de imagem hospedada externamente
- Pré-visualização da imagem antes de salvar
- Validação de URL

## Como Usar

### Acessar a Funcionalidade
1. Vá para a página `/produtos`
2. Clique em "Adicionar Imagem" ou "Alterar Imagem" na linha do produto desejado
3. Escolha entre as abas "Enviar Arquivo" ou "URL da Imagem"

### Upload de Arquivo
1. Clique na aba "Enviar Arquivo"
2. Clique em "Escolher arquivo" e selecione a imagem
3. Visualize as informações do arquivo selecionado
4. Clique em "Enviar Imagem"
5. A imagem será salva como `{codigo_produto}.{extensao}` na pasta `public/img/`

### URL Externa
1. Clique na aba "URL da Imagem"
2. Cole a URL da imagem no campo
3. Visualize a pré-visualização da imagem
4. Clique em "Salvar URL"

## Estrutura Técnica

### APIs Criadas

#### POST `/api/produtos/upload-imagem`
- Recebe arquivo via FormData
- Parâmetros:
  - `file`: Arquivo de imagem
  - `codi_psv`: Código do produto
- Validações:
  - Tipo de arquivo (deve ser imagem)
  - Tamanho máximo (5MB)
  - Código do produto obrigatório
- Salva arquivo em `public/img/{codigo}.{extensao}`
- Atualiza banco SQLite com caminho da imagem

#### POST `/api/produtos/imagem` (existente)
- Salva URL externa de imagem
- Mantém funcionalidade original

### Banco de Dados
- Tabela: `produto_imagens` (SQLite)
- Campos:
  - `id`: Chave primária
  - `codi_psv`: Código do produto
  - `url_imagem`: Caminho da imagem (local ou URL externa)
  - `data_cadastro`: Data/hora do cadastro

### Estrutura de Arquivos
```
public/
  img/                    # Pasta para imagens dos produtos
    ABC123.jpg           # Exemplo: imagem do produto ABC123
    XYZ789.png           # Exemplo: imagem do produto XYZ789
```

## Vantagens da Implementação

### Upload de Arquivo
- ✅ Imagens ficam no servidor local
- ✅ Controle total sobre os arquivos
- ✅ Não depende de serviços externos
- ✅ Nomenclatura padronizada com código do produto
- ✅ Validações de segurança

### URL Externa
- ✅ Não ocupa espaço no servidor
- ✅ Pode usar CDNs externos
- ✅ Flexibilidade para imagens já hospedadas

## Considerações de Segurança

1. **Validação de Tipo**: Apenas arquivos de imagem são aceitos
2. **Limite de Tamanho**: Máximo 5MB por arquivo
3. **Nomenclatura Segura**: Usa apenas o código do produto + extensão
4. **Substituição**: Arquivos existentes são substituídos automaticamente

## Melhorias Futuras Possíveis

- [ ] Redimensionamento automático de imagens
- [ ] Geração de thumbnails
- [ ] Múltiplas imagens por produto
- [ ] Galeria de imagens
- [ ] Compressão automática
- [ ] Backup automático das imagens 