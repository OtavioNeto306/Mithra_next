# Análise da Estrutura da Tabela CABPDV

## Resumo da Análise
Data: 30/01/2025
Objetivo: Entender a estrutura da tabela CABPDV e suas relações para construção de tela de visualização

## Estrutura da Tabela CABPDV

### Informações Gerais
- **Nome**: CABPDV (Cabeçalho de Pedidos de Venda)
- **Total de campos**: 77 campos
- **Chave primária**: CHAVE (int auto-increment)
- **Total de registros**: 998 pedidos

### Campos Principais

#### Identificação
- `CHAVE` (int) - Chave primária auto-incrementada
- `NUMERO` (varchar(6)) - Número do pedido
- `EMISSAO` (char(8)) - Data de emissão (formato YYYYMMDD)
- `DATAINC` (char(8)) - Data de inclusão
- `USUINC` (varchar(16)) - Usuário que incluiu

#### Relacionamentos
- `CLIENTE` (varchar(6)) - Código do cliente
- `VENDEDOR` (varchar(6)) - Código do vendedor
- `FORMPG` (varchar(3)) - Forma de pagamento
- `CONDICAO` (varchar(3)) - Condição de pagamento
- `TRANSP` (varchar(6)) - Transportadora

#### Valores Financeiros
- `VALOR` (varchar(12)) - Valor total do pedido
- `VALBRUT` (varchar(13)) - Valor bruto
- `VALMERC` (varchar(13)) - Valor da mercadoria
- `DESCONTO` (varchar(16)) - Desconto aplicado
- `FRETE` (varchar(16)) - Valor do frete
- `VALFRETE` (varchar(13)) - Valor do frete

#### Campos Fiscais
- `BASEICM` (varchar(12)) - Base de cálculo ICMS
- `VALICM` (varchar(12)) - Valor do ICMS
- `BASEIPI` (varchar(12)) - Base de cálculo IPI
- `VALIPI` (varchar(12)) - Valor do IPI
- `VALPIS` (varchar(12)) - Valor do PIS
- `VALCOF` (varchar(12)) - Valor do COFINS

#### Controle
- `STATUS` (char(1)) - Status do pedido
- `FLAG` (char(1)) - Flag de controle
- `FILIAL` (varchar(4)) - Código da filial

## Tabelas Relacionadas

### 1. client (Clientes)
- **Relação**: `CABPDV.CLIENTE = client.CODIGO`
- **Campos principais**: CODIGO, NOME, CGC, ENDERECO, TELEFONE, EMAIL
- **Descrição**: Dados completos dos clientes

### 2. formpg (Formas de Pagamento)
- **Relação**: `CABPDV.FORMPG = formpg.CODIGO`
- **Campos principais**: CODIGO, DESCRICAO, REGRA
- **Exemplos**: 001-DINHEIRO, 005-BOLETO, 000-SEM PAGAMENTO

### 3. itepdv (Itens da Nota Fiscal)
- **Relação**: `CABPDV.CHAVE = itepdv.CHAVE`
- **Chave composta**: CHAVE + ORDEM
- **Campos principais**: PRODUTO, QUANT, VALUNIT, TOTAL, DESCONTO
- **Descrição**: Itens detalhados de cada pedido

### 4. produt (Produtos)
- **Relação**: `itepdv.PRODUTO = produt.CODIGO`
- **Campos principais**: CODIGO, DESCRICAO, GRUPO, CUSTO, VENDA
- **Descrição**: Catálogo completo de produtos

## Exemplo de Consulta Completa

```sql
SELECT 
    c.CHAVE,
    c.NUMERO,
    c.EMISSAO,
    c.VALOR,
    cl.NOME as NOME_CLIENTE,
    cl.CGC,
    f.DESCRICAO as FORMA_PAGAMENTO,
    i.ORDEM,
    i.PRODUTO,
    p.DESCRICAO as DESC_PRODUTO,
    i.QUANT,
    i.VALUNIT,
    i.TOTAL
FROM CABPDV c 
LEFT JOIN client cl ON c.CLIENTE = cl.CODIGO 
LEFT JOIN formpg f ON c.FORMPG = f.CODIGO 
LEFT JOIN itepdv i ON c.CHAVE = i.CHAVE 
LEFT JOIN produt p ON i.PRODUTO = p.CODIGO
WHERE c.CHAVE = ?
ORDER BY i.ORDEM
```

## Observações Importantes

1. **Datas**: Armazenadas como string no formato YYYYMMDD
2. **Valores**: Armazenados como varchar, necessário conversão para cálculos
3. **Relações**: Feitas por código, sem foreign keys formais
4. **Integridade**: Nem todos os pedidos têm itens na tabela itepdv
5. **Campos texto**: Alguns campos têm observações (OBSERV, OBS_INT)

## Interface Atual de Pedidos

### Estrutura de Arquivos
- `app/pedidos/page.tsx` - Lista de pedidos (243 linhas)
- `app/pedidos/[id]/page.tsx` - Detalhes do pedido (495 linhas)
- `app/pedidos/loading.tsx` - Estado de carregamento

### Funcionalidades Implementadas
- ✅ Lista de pedidos com busca e filtros
- ✅ Página de detalhes completa
- ✅ Interface responsiva e moderna
- ✅ Badges coloridos por status
- ✅ Navegação entre páginas

### Estado Atual dos Dados
- ❌ **Dados mockados/estáticos** - 7 pedidos hardcoded
- ❌ **Sem integração com CABPDV**
- ❌ **Sem APIs implementadas**

### Mapeamento Necessário (Mock → CABPDV)
```typescript
Mock.id          → CABPDV.CHAVE
Mock.codigo      → CABPDV.NUMERO  
Mock.cliente     → client.NOME (via CABPDV.CLIENTE)
Mock.data        → CABPDV.EMISSAO (conversão YYYYMMDD → Date)
Mock.valor       → CABPDV.VALOR (conversão string → number)
Mock.status      → CABPDV.STATUS (mapeamento de códigos)
```

## Próximos Passos para Tela de Visualização

1. **Listagem de Pedidos**: Mostrar CABPDV com dados do cliente
2. **Detalhes do Pedido**: Exibir itens com descrição dos produtos
3. **Filtros**: Por data, cliente, vendedor, status
4. **Totalizadores**: Valores por período, cliente, etc.
5. **Relatórios**: Exportação de dados para análise

### Implementação Recomendada
1. **Criar API routes** (`app/api/pedidos/route.ts`)
2. **Implementar queries** MySQL usando MCP
3. **Substituir dados mockados** por dados reais
4. **Adicionar paginação** e filtros avançados
5. **Implementar funcionalidades** de criação/edição

## Considerações Técnicas

- Implementar conversão de datas (string → Date)
- Tratar valores monetários (string → number)
- Implementar paginação para grandes volumes
- Cache para consultas frequentes
- Validação de integridade referencial

## Status da Implementação
- ✅ **Interface**: Completa e funcional
- ❌ **Backend**: Sem integração com CABPDV
- ❌ **APIs**: Não implementadas
- ⚠️ **Dados**: Mockados/estáticos 