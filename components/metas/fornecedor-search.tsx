'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Fornecedor {
  codigo: string;
  nome: string;
}

interface FornecedorSearchProps {
  value?: Fornecedor | null;
  onChange: (fornecedor: Fornecedor | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function FornecedorSearch({
  value,
  onChange,
  placeholder = "Buscar fornecedor...",
  className,
  disabled = false
}: FornecedorSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value?.nome || '');
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar fornecedores
  useEffect(() => {
    const loadFornecedores = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/fornecedores');
        const data = await response.json();
        
        if (data.success) {
          setFornecedores(data.data || []);
        } else {
          console.error('Erro ao carregar fornecedores:', data.error);
          setFornecedores([]);
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        setFornecedores([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFornecedores();
  }, []);

  // Filtrar fornecedores baseado no termo de busca
  const filteredFornecedores = fornecedores.filter(fornecedor =>
    (fornecedor.nome && fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (fornecedor.codigo && fornecedor.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10); // Limitar a 10 resultados

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredFornecedores.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredFornecedores[selectedIndex]) {
          handleSelectFornecedor(filteredFornecedores[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectFornecedor = (fornecedor: Fornecedor) => {
    onChange(fornecedor);
    setSearchTerm(fornecedor.nome || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || '';
    setSearchTerm(newValue);
    setShowDropdown(true);
    setSelectedIndex(-1);
    
    // Se o campo foi limpo, limpar a seleção
    if (!newValue && value) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  // Sincronizar o valor do input com o fornecedor selecionado
  useEffect(() => {
    if (value) {
      setSearchTerm(value.nome || '');
    } else {
      setSearchTerm('');
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredFornecedores.length > 0 ? (
            filteredFornecedores.map((fornecedor, index) => (
              <div
                key={fornecedor.codigo}
                className={cn(
                  "px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                  selectedIndex === index && "bg-blue-50"
                )}
                onClick={() => handleSelectFornecedor(fornecedor)}
              >
                <div className="font-medium text-gray-900">
                  {fornecedor.nome}
                </div>
                <div className="text-sm text-gray-500">
                  Código: {fornecedor.codigo}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-center">
              {isLoading ? 'Carregando...' : 'Nenhum fornecedor encontrado'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}