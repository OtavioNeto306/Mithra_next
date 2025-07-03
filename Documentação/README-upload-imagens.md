# Upload de Imagens para Produtos com Processamento Automático

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS**

O sistema agora permite fazer upload de imagens para produtos com **processamento automático inteligente**:

### ✨ **Processamento Automático de Imagens**
- **Redimensionamento**: Imagens maiores que 600x600px são automaticamente redimensionadas
- **Compressão**: Todas as imagens são comprimidas para máximo 500KB
- **Otimização**: Mantém a melhor qualidade possível dentro dos limites
- **Conversão**: Se necessário, converte para WebP para melhor compressão
- **Preservação**: Imagens menores que os limites são preservadas

### 📋 **Especificações Técnicas**
- **Dimensão máxima**: 600x600 pixels
- **Tamanho máximo final**: 500KB
- **Upload máximo**: 10MB (será otimizado)
- **Formatos aceitos**: JPG, PNG, GIF, WebP, SVG
- **Proporção**: Mantida automaticamente (fit: inside)

---

## 🛠️ **COMO USAR**

### **Acessar a Funcionalidade**
1. Vá para a página `/produtos`
2. Clique em "Adicionar Imagem" ou "Alterar Imagem" na linha do produto desejado
3. Escolha entre as abas "Enviar Arquivo" ou "URL da Imagem"

### **Upload de Arquivo (Recomendado)**
1. Clique na aba "Enviar Arquivo"
2. Clique em "Escolher arquivo" e selecione a imagem
3. Visualize as informações do arquivo selecionado
4. Clique em "Enviar Imagem"
5. **A imagem será automaticamente processada:**
   - Redimensionada se necessário
   - Comprimida para otimizar tamanho
   - Salva como `{codigo_produto}.{extensao}` na pasta `public/img/`

### **Feedback do Processamento**
Após o upload, você receberá informações detalhadas:
- 📏 **Dimensões**: Original → Final
- 📦 **Tamanho**: Original → Final (em KB)
- 🔄 **Redimensionamento**: Se foi aplicado
- 🗜️ **Compressão**: Percentual de economia
- ✨ **Otimização**: Status do processamento

### **URL Externa**
1. Clique na aba "URL da Imagem"
2. Cole a URL da imagem no campo
3. Visualize a pré-visualização da imagem
4. Clique em "Salvar URL"

---

## 🏗️ **ESTRUTURA TÉCNICA**

### **APIs Criadas**

#### **POST `/api/produtos/upload-imagem`** (Atualizada)
- Recebe arquivo via FormData
- **Processamento automático** com Sharp
- Parâmetros:
  - `file`: Arquivo de imagem (máximo 10MB)
  - `codi_psv`: Código do produto
- **Validações**:
  - Tipo de arquivo (deve ser imagem)
  - Tamanho máximo (10MB para upload)
  - Código do produto obrigatório
- **Processamento**:
  - Redimensiona para 600x600px se necessário
  - Comprime para máximo 500KB
  - Converte para WebP se necessário para melhor compressão
- **Fallback**: Se o processamento falhar, salva a imagem original
- **Resposta**: Inclui informações detalhadas do processamento

#### **GET `/api/img/[filename]`** (Nova)
- Serve imagens dinamicamente
- Funciona para imagens adicionadas após o build
- Headers de cache otimizados
- Suporte a todos os formatos de imagem

#### **POST `/api/produtos/imagem`** (Existente)
- Salva URL externa de imagem
- Mantém funcionalidade original

### **Biblioteca de Processamento**
```typescript
// lib/image-processor.ts
export class ImageProcessor {
  static async processImage(
    inputBuffer: Buffer,
    outputPath: string,
    options?: ImageProcessingOptions
  ): Promise<ProcessingResult>
}
```

**Funcionalidades da biblioteca:**
- Redimensionamento inteligente (mantém proporção)
- Compressão progressiva (reduz qualidade se necessário)
- Conversão automática para WebP
- Logs detalhados do processamento
- Tratamento de erros robusto

### **Banco de Dados**
- Tabela: `produto_imagens` (SQLite)
- Campos:
  - `id`: Chave primária
  - `codi_psv`: Código do produto
  - `url_imagem`: Caminho da imagem (local ou URL externa)
  - `data_cadastro`: Data/hora do cadastro

### **Estrutura de Arquivos**
```
public/
  img/                    # Pasta para imagens dos produtos
    ABC123.jpg           # Exemplo: imagem do produto ABC123
    XYZ789.webp          # Exemplo: imagem convertida para WebP
lib/
  image-processor.ts     # Biblioteca de processamento
app/
  api/
    img/[filename]/      # API route para servir imagens
    produtos/
      upload-imagem/     # API de upload com processamento
```

---

## 🎯 **VANTAGENS DA IMPLEMENTAÇÃO**

### **Processamento Automático**
- ✅ **Zero configuração**: Funciona automaticamente
- ✅ **Otimização inteligente**: Melhor qualidade possível
- ✅ **Economia de espaço**: Até 90% de redução de tamanho
- ✅ **Performance**: Carregamento mais rápido
- ✅ **Compatibilidade**: Funciona em todos os dispositivos

### **Upload de Arquivo**
- ✅ **Imagens ficam no servidor local**
- ✅ **Controle total sobre os arquivos**
- ✅ **Não depende de serviços externos**
- ✅ **Nomenclatura padronizada com código do produto**
- ✅ **Validações de segurança**
- ✅ **Processamento automático**

### **URL Externa**
- ✅ **Não ocupa espaço no servidor**
- ✅ **Pode usar CDNs externos**
- ✅ **Flexibilidade para imagens já hospedadas**

### **API Route Dinâmica**
- ✅ **Serve imagens imediatamente após upload**
- ✅ **Não requer rebuild do Next.js**
- ✅ **Headers de cache otimizados**
- ✅ **Suporte a todos os formatos**

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **Personalizar Processamento**
```typescript
// Exemplo de configuração customizada
const options = {
  maxWidth: 800,      // Largura máxima
  maxHeight: 800,     // Altura máxima  
  maxSizeKB: 300,     // Tamanho máximo em KB
  quality: 90         // Qualidade inicial (0-100)
};
```

### **Monitoramento**
```bash
# Ver logs do processamento
pm2 logs mithra-next

# Verificar status
pm2 list

# Reiniciar se necessário
pm2 restart mithra-next
```

---

## 🛡️ **CONSIDERAÇÕES DE SEGURANÇA**

1. **Validação de Tipo**: Apenas arquivos de imagem são aceitos
2. **Limite de Tamanho**: Máximo 10MB para upload
3. **Nomenclatura Segura**: Usa apenas o código do produto + extensão
4. **Path Traversal**: Proteção contra ataques de diretório
5. **Substituição**: Arquivos existentes são substituídos automaticamente
6. **Fallback**: Sistema continua funcionando mesmo se processamento falhar

---

## 📊 **EXEMPLOS DE PROCESSAMENTO**

### **Imagem Grande (2MB, 1920x1080)**
```
📸 Original: 1920x1080, 2048KB
🔄 Redimensionada para: 600x338
🗜️ Comprimida: 2048KB → 180KB
💾 Economia: 91%
```

### **Imagem Pequena (50KB, 300x300)**
```
📸 Original: 300x300, 50KB
✅ Mantida: 300x300, 48KB
💾 Economia: 4% (apenas compressão)
```

### **Imagem Muito Grande (5MB, 4000x3000)**
```
📸 Original: 4000x3000, 5120KB
🔄 Redimensionada para: 600x450
🗜️ Comprimida: 5120KB → 320KB
🔄 Convertida para WebP: 320KB → 180KB
💾 Economia: 96%
```

---

## 🚀 **MELHORIAS FUTURAS POSSÍVEIS**

- [ ] **Múltiplas imagens por produto**
- [ ] **Galeria de imagens**
- [ ] **Thumbnails automáticos**
- [ ] **Marca d'água automática**
- [ ] **Backup automático das imagens**
- [ ] **CDN integration**
- [ ] **Processamento em background**
- [ ] **Análise de qualidade de imagem**

---

## 🎉 **RESULTADO FINAL**

O sistema agora oferece:
- ✅ **Upload inteligente** com processamento automático
- ✅ **Otimização de performance** (imagens até 500KB)
- ✅ **Compatibilidade total** com Next.js + PM2
- ✅ **Experiência do usuário aprimorada**
- ✅ **Economia de espaço e bandwidth**
- ✅ **Manutenção zero** (funciona automaticamente)

**Todas as imagens são automaticamente otimizadas para 600x600px e máximo 500KB, garantindo performance excelente sem perda significativa de qualidade!** 🎯 