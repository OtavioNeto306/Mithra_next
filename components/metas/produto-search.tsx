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
  const [searchTerm, setSearchTerm] = useState(value?.nome || '');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce para busca de produtos
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm && searchTerm.trim().length >= 2) {
        setIsLoading(true);
        setHasConnectionError(false);
        
        try {
          console.log('Fazendo requisição para:', `/api/produtos/search?q=${encodeURIComponent(searchTerm.trim())}`);
          const response = await fetch(`/api/produtos/search?q=${encodeURIComponent(searchTerm.trim())}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Dados recebidos da API:', data);
          
          if (data.success) {
            console.log('Produtos encontrados:', data.data?.length || 0);
            // Mapear os dados para o formato esperado pelo componente
            const produtosMapeados = (data.data || []).map((produto: any) => ({
              codigo: produto.CODIGO || produto.codigo || '',
              nome: produto.NOME || produto.nome || '',
              descricao: produto.DESCRICAO || produto.descricao || ''
            }));
            console.log('Produtos mapeados:', produtosMapeados);
            setProdutos(produtosMapeados);
            setShowDropdown(true);
          } else {
            console.error('Erro ao carregar produtos:', data.error);
            setProdutos([]);
            if (data.error && data.error.includes('conexão')) {
              setHasConnectionError(true);
            }
          }
        } catch (error) {
          console.error('Erro na requisição:', error);
          setProdutos([]);
          setHasConnectionError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setProdutos([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || produtos.length === 0) return;

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
        if (selectedIndex >= 0 && selectedIndex < produtos.length) {
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
    setSearchTerm(produto.nome || '');
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
    const newValue = e.target.value || '';
    setSearchTerm(newValue);
    setSelectedIndex(-1);
    
    // Se o campo foi limpo, limpar a seleção
    if (!newValue && value) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm && searchTerm.trim() && produtos.length > 0) {
      setShowDropdown(true);
    }
  };

  // Sincronizar o valor do input com o produto selecionado
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
          value={searchTerm || ''}
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

      {showDropdown && searchTerm && searchTerm.trim() && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {produtos.length > 0 ? (
            produtos.map((produto, index) => {
              console.log('Renderizando produto:', produto);
              return (
                <div
                  key={produto.codigo || `produto-${index}`}
                  className={cn(
                    "px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0",
                    "hover:bg-gray-50 transition-colors",
                    selectedIndex === index && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleSelectProduto(produto)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {produto.nome}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {produto.codigo}
                      </span>
                    </div>
                    {produto.descricao && (
                      <span className="text-sm text-gray-600 mt-1">
                        {produto.descricao}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-2 text-gray-500 text-center">
              {isLoading ? (
                'Buscando produtos...'
              ) : hasConnectionError ? (
                <div className="text-red-500">
                  <div className="font-medium">Erro de conexão</div>
                  <div className="text-xs mt-1">Não foi possível conectar ao banco de dados</div>
                </div>
              ) : searchTerm.length < 2 ? (
                'Digite pelo menos 2 caracteres'
              ) : (
                'Nenhum produto encontrado'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}