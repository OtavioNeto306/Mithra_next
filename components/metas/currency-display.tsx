'use client';

import { useState, useEffect } from 'react';

interface CurrencyDisplayProps {
  value: number;
  className?: string;
}

export function CurrencyDisplay({ value, className }: CurrencyDisplayProps) {
  const [formattedValue, setFormattedValue] = useState<string>('');

  useEffect(() => {
    setFormattedValue(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    );
  }, [value]);

  return (
    <span className={className}>
      {formattedValue || 'R$ 0,00'}
    </span>
  );
} 