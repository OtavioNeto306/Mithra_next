import sharp from 'sharp';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeKB?: number;
  quality?: number;
}

interface ProcessingResult {
  success: boolean;
  originalSize: number;
  finalSize: number;
  originalDimensions: { width: number; height: number };
  finalDimensions: { width: number; height: number };
  wasResized: boolean;
  wasCompressed: boolean;
  filePath: string;
}

export class ImageProcessor {
  private static readonly DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
    maxWidth: 600,
    maxHeight: 600,
    maxSizeKB: 500,
    quality: 85
  };

  /**
   * Processa uma imagem: redimensiona se necessário e comprime para o tamanho desejado
   */
  static async processImage(
    inputBuffer: Buffer,
    outputPath: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Obter informações da imagem original
      const originalImage = sharp(inputBuffer);
      const originalMetadata = await originalImage.metadata();
      const originalSize = inputBuffer.length;
      
      if (!originalMetadata.width || !originalMetadata.height) {
        throw new Error('Não foi possível obter dimensões da imagem');
      }

      const originalDimensions = {
        width: originalMetadata.width,
        height: originalMetadata.height
      };

      console.log(`📸 Processando imagem: ${originalDimensions.width}x${originalDimensions.height}, ${Math.round(originalSize / 1024)}KB`);

      // Verificar se precisa redimensionar
      const needsResize = originalDimensions.width > opts.maxWidth || 
                         originalDimensions.height > opts.maxHeight;

      let processedImage = originalImage;
      let finalDimensions = originalDimensions;

      // Redimensionar se necessário
      if (needsResize) {
        processedImage = processedImage.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside', // Mantém proporção
          withoutEnlargement: true // Não aumenta imagens pequenas
        });

        // Obter novas dimensões
        const resizedMetadata = await processedImage.metadata();
        finalDimensions = {
          width: resizedMetadata.width || originalDimensions.width,
          height: resizedMetadata.height || originalDimensions.height
        };

        console.log(`🔄 Redimensionada para: ${finalDimensions.width}x${finalDimensions.height}`);
      }

      // Determinar formato e aplicar compressão
      const format = originalMetadata.format;
      let quality = opts.quality;
      let finalBuffer: Buffer;

      // Primeira tentativa com qualidade padrão
      finalBuffer = await this.compressImage(processedImage, format, quality);

      // Se ainda está muito grande, reduzir qualidade gradualmente
      const maxSizeBytes = opts.maxSizeKB * 1024;
      let attempts = 0;
      const maxAttempts = 5;

      while (finalBuffer.length > maxSizeBytes && quality > 20 && attempts < maxAttempts) {
        quality -= 15;
        attempts++;
        console.log(`🗜️ Tentativa ${attempts}: Reduzindo qualidade para ${quality}%`);
        finalBuffer = await this.compressImage(processedImage, format, quality);
      }

      // Se ainda está grande, tentar converter para WebP (mais eficiente)
      if (finalBuffer.length > maxSizeBytes && format !== 'webp') {
        console.log('🔄 Convertendo para WebP para melhor compressão...');
        finalBuffer = await processedImage
          .webp({ quality: Math.max(quality, 60) })
          .toBuffer();
        
        // Atualizar caminho do arquivo para .webp
        outputPath = outputPath.replace(/\.[^.]+$/, '.webp');
      }

      // Salvar arquivo processado
      await writeFile(outputPath, finalBuffer);

      const finalSize = finalBuffer.length;
      const wasResized = needsResize;
      const wasCompressed = finalSize < originalSize;

      console.log(`✅ Processamento concluído:`);
      console.log(`   📏 Dimensões: ${originalDimensions.width}x${originalDimensions.height} → ${finalDimensions.width}x${finalDimensions.height}`);
      console.log(`   📦 Tamanho: ${Math.round(originalSize / 1024)}KB → ${Math.round(finalSize / 1024)}KB`);
      console.log(`   💾 Economia: ${Math.round((1 - finalSize / originalSize) * 100)}%`);

      return {
        success: true,
        originalSize,
        finalSize,
        originalDimensions,
        finalDimensions,
        wasResized,
        wasCompressed,
        filePath: outputPath
      };

    } catch (error) {
      console.error('❌ Erro no processamento da imagem:', error);
      throw error;
    }
  }

  /**
   * Comprime uma imagem mantendo o formato original
   */
  private static async compressImage(
    image: sharp.Sharp,
    format: string | undefined,
    quality: number
  ): Promise<Buffer> {
    switch (format) {
      case 'jpeg':
      case 'jpg':
        return image.jpeg({ quality, mozjpeg: true }).toBuffer();
      
      case 'png':
        return image.png({ 
          quality,
          compressionLevel: 9,
          palette: true // Usar paleta quando possível
        }).toBuffer();
      
      case 'webp':
        return image.webp({ quality }).toBuffer();
      
      default:
        // Para formatos não suportados, converter para JPEG
        return image.jpeg({ quality, mozjpeg: true }).toBuffer();
    }
  }

  /**
   * Verifica se uma imagem precisa ser processada
   */
  static async needsProcessing(
    filePath: string,
    options: ImageProcessingOptions = {}
  ): Promise<boolean> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      const buffer = await readFile(filePath);
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      const sizeKB = buffer.length / 1024;
      const needsResize = (metadata.width || 0) > opts.maxWidth || 
                         (metadata.height || 0) > opts.maxHeight;
      const needsCompression = sizeKB > opts.maxSizeKB;
      
      return needsResize || needsCompression;
    } catch (error) {
      console.error('Erro ao verificar se imagem precisa processamento:', error);
      return false;
    }
  }

  /**
   * Obtém informações de uma imagem
   */
  static async getImageInfo(filePath: string) {
    try {
      const buffer = await readFile(filePath);
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        sizeKB: Math.round(buffer.length / 1024),
        sizeBytes: buffer.length
      };
    } catch (error) {
      console.error('Erro ao obter informações da imagem:', error);
      return null;
    }
  }
} 