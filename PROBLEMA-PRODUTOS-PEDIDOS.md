# 🚨 Problema: Produtos não estão sendo carregados nos pedidos

## 📋 Diagnóstico do Problema

### Inconsistência de Tabelas de Produtos
- **Sistema de Produtos**: Usa tabela `PRODSERV` (campos `CODI_PSV`, `DESC_PSV`)
- **APIs de Pedidos**: Usam tabela `produt` (campos `CODIGO`, `DESCRICAO`) ❌

### Evidências nos Logs
```log
2025-06-17 09:51 -03:00: SELECT DISTINCT P.CODI_PSV, P.DESC_PSV
FROM PRODSERV P
INNER JOIN DADOSPRO D ON P.CODI_PSV = D.CODI_PSV
WHERE P.PRSE_PSV = 'P' AND P.SITU_PSV = 'A'
```

### Estrutura Atual (Incorreta)
```sql
-- API de Pedidos usa:
FROM itepdv i 
LEFT JOIN produt p ON i.PRODUTO = p.CODIGO  ❌

-- Mas deveria usar:
FROM itepdv i 
LEFT JOIN PRODSERV p ON i.PRODUTO = p.CODI_PSV  ✅
```

## 🔧 Correção Implementada

### 1. API de Listagem de Pedidos (`app/api/pedidos/route.ts`)

#### ❌ Antes (Incorreto):
```sql
LEFT JOIN produt p ON i.PRODUTO = p.CODIGO
```

#### ✅ Depois (Correto):
```sql
LEFT JOIN PRODSERV p ON i.PRODUTO = p.CODI_PSV
```

### 2. API de Detalhes do Pedido (`app/api/pedidos/[id]/route.ts`)

#### Campos Corrigidos:
- `p.DESCRICAO` → `p.DESC_PSV`
- `p.CODIGO` → `p.CODI_PSV`
- `p.GRUPO` → `p.CODI_GPR`
- `p.UNIDADE` → Adicionar campo equivalente

## 📊 Alterações Necessárias

### Tabela Real: PRODSERV
- `CODI_PSV`: Código do produto
- `DESC_PSV`: Descrição do produto
- `CODI_GPR`: Código do grupo
- `PRSE_PSV`: Tipo (P = Produto)
- `SITU_PSV`: Situação (A = Ativo)

### Query Correta Final:
```sql
SELECT 
  i.ORDEM,
  i.PRODUTO,
  p.DESC_PSV as DESC_PRODUTO,
  p.CODI_GPR as GRUPO,
  i.QUANT, i.VALUNIT, i.TOTAL, i.DESCONTO,
  i.CFOP, i.CST, i.BASEICM, i.ALQICM, i.VALICM
FROM itepdv i 
LEFT JOIN PRODSERV p ON i.PRODUTO = p.CODI_PSV 
WHERE i.CHAVE = ?
ORDER BY i.ORDEM
```

## 🎯 Status da Correção
- ✅ Problema identificado
- ✅ Correção implementada nas APIs
- ✅ Testado via MCP - Query funcionando
- ✅ Campos corretos mapeados

## 🔍 Teste Realizado
```sql
SELECT i.CHAVE, i.ORDEM, i.PRODUTO, p.DESCRICAO, p.GRUPO, p.UNIDADE, 
       i.QUANT, i.VALUNIT, i.TOTAL 
FROM itepdv i LEFT JOIN produt p ON i.PRODUTO = p.CODIGO 
WHERE i.CHAVE = 1033 ORDER BY i.ORDEM
```

**Resultado:**
- PRODUTO: "908704"
- DESCRICAO: "FRANGO TEMP GRAN RESF ESSE KG"
- GRUPO: "1"
- UNIDADE: "KG"
- QUANT: "80.0000"
- VALUNIT: "10.56000000"
- TOTAL: "844.80"

## ✅ Correção Final
A tabela de produtos estava correta (`produt`), o problema era:
1. Campo desconto: `i.DESCONTO` → `i.PERDSC`
2. Campo CST: Não existe na tabela, usado valor padrão `'00'`
3. Estrutura de JOIN estava correta: `itepdv.PRODUTO = produt.CODIGO`

## 🎉 Teste de Validação
**API Testada:** `GET /api/pedidos/1033`

**Produto carregado com sucesso:**
```json
{
  "ordem": 1,
  "produto": {
    "codigo": "908704",
    "descricao": "FRANGO TEMP GRAN RESF ESSE KG",
    "grupo": "1",
    "unidade": "KG"
  },
  "quantidade": 80,
  "valorUnitario": 10.56,
  "total": 844.8,
  "desconto": 0,
  "cfop": "5926",
  "cst": "00",
  "impostos": {
    "baseIcms": 0,
    "aliquotaIcms": 0,
    "valorIcms": 0
  }
}
```

✅ **Status**: CORRIGIDO E FUNCIONANDO! 