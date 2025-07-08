# Changelog - Melhorias do Sistema

## Data: 2025-01-22

### Correção: Busca Case-Insensitive de Produtos

**Problema:** A busca de produtos só funcionava quando digitada em caixa alta (case-sensitive).

**Solução:** Implementada busca case-insensitive na API de produtos usando a função `UPPER()` tanto no valor da busca quanto nos campos do banco.

**Arquivo modificado:** `app/api/produtos/route.ts`

**Alteração:**
```typescript
// Antes (case-sensitive)
let whereBusca = busca 
  ? `AND (P.CODI_PSV LIKE '%${busca}%' OR P.DESC_PSV LIKE '%${busca}%')`
  : '';

// Depois (case-insensitive)
let whereBusca = busca 
  ? `AND (UPPER(P.CODI_PSV) LIKE '%${busca.toUpperCase()}%' OR UPPER(P.DESC_PSV) LIKE '%${busca.toUpperCase()}%')`
  : '';
```

**Impacto:** 
- Agora é possível buscar produtos digitando em minúsculas, maiúsculas ou combinações
- Melhora a usabilidade da busca de produtos
- Funciona tanto para código do produto quanto para descrição

**Relacionado ao projeto:** Esta correção melhora a experiência do usuário na página de produtos, permitindo busca mais flexível e intuitiva. 