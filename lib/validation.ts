/**
 * Utilitários para validação de parâmetros da API
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export class ValidationResult {
  public isValid: boolean;
  public errors: ValidationError[];

  constructor() {
    this.isValid = true;
    this.errors = [];
  }

  addError(field: string, message: string, value?: any): void {
    this.isValid = false;
    this.errors.push({ field, message, value });
  }

  getFirstError(): ValidationError | null {
    return this.errors.length > 0 ? this.errors[0] : null;
  }

  getErrorsByField(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }
}

export class ApiValidator {
  /**
   * Valida parâmetros de paginação
   */
  static validatePagination(page?: string, limit?: string): ValidationResult {
    const result = new ValidationResult();
    
    // Validação da página
    if (page !== undefined && page !== null && page !== '') {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        result.addError('page', 'Página deve ser um número maior que 0', page);
      }
    }
    
    // Validação do limite
    if (limit !== undefined && limit !== null && limit !== '') {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        result.addError('limit', 'Limite deve ser um número entre 1 e 100', limit);
      }
    }
    
    return result;
  }

  /**
   * Valida parâmetros de busca
   */
  static validateSearch(search?: string): ValidationResult {
    const result = new ValidationResult();
    
    if (search !== undefined && search !== null && search !== '') {
      // Remove espaços em branco
      const trimmedSearch = search.trim();
      
      if (trimmedSearch.length === 0) {
        // String vazia após trim é válida (não é um erro)
        return result;
      }
      
      if (trimmedSearch.length > 100) {
        result.addError('search', 'Termo de busca muito longo (máximo 100 caracteres)', search);
      }
      
      // Sanitização básica - remove caracteres especiais perigosos
      const sanitized = trimmedSearch.replace(/[<>'"]/g, '');
      if (sanitized !== trimmedSearch) {
        result.addError('search', 'Termo de busca contém caracteres inválidos', search);
      }
    }
    
    return result;
  }

  /**
   * Valida status de pedidos
   */
  static validateStatus(status?: string): ValidationResult {
    const result = new ValidationResult();
    
    if (status !== undefined && status !== null && status !== '') {
      const validStatuses = ['pendente', 'faturado', 'cancelado', 'em processamento', 'todos'];
      
      if (!validStatuses.includes(status.toLowerCase())) {
        result.addError('status', `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`, status);
      }
    }
    
    return result;
  }

  /**
   * Valida parâmetros de data
   */
  static validateDate(dateStr?: string, fieldName: string = 'date'): ValidationResult {
    const result = new ValidationResult();
    
    if (dateStr !== undefined && dateStr !== null && dateStr !== '') {
      // Verifica formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      if (!dateRegex.test(dateStr)) {
        result.addError(fieldName, 'Data deve estar no formato YYYY-MM-DD', dateStr);
      } else {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          result.addError(fieldName, 'Data inválida', dateStr);
        }
      }
    }
    
    return result;
  }

  /**
   * Valida ID numérico
   */
  static validateId(id?: string, fieldName: string = 'id'): ValidationResult {
    const result = new ValidationResult();
    
    if (id !== undefined && id !== null && id !== '') {
      const idNum = parseInt(id);
      
      if (isNaN(idNum) || idNum < 1) {
        result.addError(fieldName, 'ID deve ser um número maior que 0', id);
      }
    }
    
    return result;
  }

  /**
   * Combina múltiplos resultados de validação
   */
  static combineResults(...results: ValidationResult[]): ValidationResult {
    const combined = new ValidationResult();
    
    for (const result of results) {
      if (!result.isValid) {
        combined.isValid = false;
        combined.errors.push(...result.errors);
      }
    }
    
    return combined;
  }

  /**
   * Sanitiza string removendo caracteres perigosos
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>'"]/g, '') // Remove caracteres perigosos
      .replace(/\s+/g, ' '); // Normaliza espaços
  }

  /**
   * Converte string para número com validação
   */
  static parseNumber(value: string, defaultValue: number = 0): number {
    if (!value) return defaultValue;
    
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Converte string para inteiro com validação
   */
  static parseInt(value: string, defaultValue: number = 0): number {
    if (!value) return defaultValue;
    
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
  }
}

export default ApiValidator; 