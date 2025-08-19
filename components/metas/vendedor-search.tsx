'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface Vendedor {
  codigo: string;
  nome: string;
}

interface VendedorSearchProps {
  value: string;
  onChange: (codigo: string) => void;
  onNameChange?: (nome: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function VendedorSearch({ 
  value, 
  onChange, 
  onNameChange,
  disabled = false, 
  error = false,
  placeholder = "Digite o nome do vendedor"
}: VendedorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [filteredVendedores, setFilteredVendedores] = useState<Vendedor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar vendedores na inicialização
  useEffect(() => {
    fetchVendedores();
  }, []);

  // Buscar vendedores da API
  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vendedores');
      const data = await response.json();
      
      if (data.success) {
        setVendedores(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vendedores baseado no termo de busca
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setFilteredVendedores([]);
      setShowDropdown(false);
      return;
    }

    const filtered = vendedores.filter(vendedor =>
      vendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendedor.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredVendedores(filtered.slice(0, 10)); // Limitar a 10 resultados
    setShowDropdown(filtered.length > 0);
  }, [searchTerm, vendedores]);

  // Definir vendedor selecionado baseado no código
  useEffect(() => {
    if (value) {
      const vendedor = vendedores.find(v => v.codigo === value);
      if (vendedor) {
        setSelectedVendedor(vendedor);
        setSearchTerm(vendedor.nome || '');
      }
    } else {
      setSelectedVendedor(null);
      setSearchTerm('');
    }
  }, [value, vendedores]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selecionar vendedor
  const handleSelectVendedor = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor);
    setSearchTerm(vendedor.nome || '');
    onChange(vendedor.codigo);
    if (onNameChange) {
      onNameChange(vendedor.nome || '');
    }
    setShowDropdown(false);
  };

  // Limpar seleção
  const handleClear = () => {
    setSelectedVendedor(null);
    setSearchTerm('');
    onChange('');
    if (onNameChange) {
      onNameChange('');
    }
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Manipular mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || '';
    setSearchTerm(newValue);
    
    // Se o usuário digitou algo diferente do nome selecionado, limpar a seleção
    if (selectedVendedor && newValue !== selectedVendedor.nome) {
      setSelectedVendedor(null);
      onChange('');
      if (onNameChange) {
        onNameChange('');
      }
    }
  };

  return (
    <div className="relative">
      <Label htmlFor="vendedor-search">Nome do Vendedor *</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="vendedor-search"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pr-10 ${error ? 'border-red-500' : ''}`}
          disabled={disabled || loading}
          onFocus={() => {
            if (filteredVendedores.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        
        {/* Ícone de busca */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          ) : selectedVendedor ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredVendedores.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Nenhum vendedor encontrado
            </div>
          ) : (
            filteredVendedores.map((vendedor) => (
              <button
                key={vendedor.codigo}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleSelectVendedor(vendedor)}
              >
                <div className="font-medium">{vendedor.nome}</div>
                <div className="text-sm text-gray-500">{vendedor.codigo}</div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Mostrar código selecionado */}
      {selectedVendedor && (
        <div className="mt-1 text-xs text-gray-500">
          Código: {selectedVendedor.codigo}
        </div>
      )}
    </div>
  );
}