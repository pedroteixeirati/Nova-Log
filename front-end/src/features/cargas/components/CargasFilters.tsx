import React from 'react';
import { Search } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import Input from '../../../shared/ui/Input';

interface CargasFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function CargasFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: CargasFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_240px]">
      <Input
        label="Buscar"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por cliente, carga, frete ou rota"
        leftIcon={<Search className="h-4 w-4" />}
      />

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</span>
        <CustomSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'Todos os status' },
            { value: 'planned', label: 'Planejada' },
            { value: 'loading', label: 'Carregando' },
            { value: 'in_transit', label: 'Em transito' },
            { value: 'delivered', label: 'Entregue' },
            { value: 'cancelled', label: 'Cancelada' },
          ]}
        />
      </div>
    </div>
  );
}
