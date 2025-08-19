'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Produto {
  codigo: string;
  nome: string;
  descricao?: string;
}

interface ProdutoSearchProps {
  value?: Produto | null;
  onChange: (produto: Produto | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ProdutoSearch({
  value,
  onChange,
  placeholder = "Buscar produto...",
  className,
  disabled = false
}: ProdutoSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar produtos com busca dinâmica
  useEffect(() => {
    const loadProdutos = async () => {
      if (!searchTerm.trim()) {
        setProdutos([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/produtos/search?search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.success) {
          setProdutos(data.data || []);
        } else {
          console.error('Erro ao carregar produtos:', data.error);
          setProdutos([]);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProdutos([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(loadProdutos, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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
          prev < produtos.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && produtos[selectedIndex]) {
          handleSelectProduto(produtos[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectProduto = (produto: Produto) => {
    onChange(produto);
    setSearchTerm(produto.nome);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    setProdutos([]);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowDropdown(true);
    setSelectedIndex(-1);
    
    // Se o campo foi limpo, limpar a seleção
    if (!newValue && value) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setShowDropdown(true);
    }
  };

  // Sincronizar o valor do input com o produto selecionado
  useEffect(() => {
    if (value) {
      setSearchTerm(value.nome);
    } else if (!searchTerm) {
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

      {showDropdown && searchTerm.trim() && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {produtos.length > 0 ? (
            produtos.map((produto, index) => (
              <div
                key={produto.codigo}
                className={cn(
                  "px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                  selectedIndex === index && "bg-blue-50"
                )}
                onClick={() => handleSelectProduto(produto)}
              >
                <div className="font-medium text-gray-900">
                  {produto.nome}
                </div>
                <div className="text-sm text-gray-500">
                  Código: {produto.codigo}
                  {produto.descricao && (
                    <span className="ml-2">• {produto.descricao}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-center">
              {isLoading ? 'Buscando produtos...' : searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum produto encontrado'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}