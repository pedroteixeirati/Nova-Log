import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { NavItem } from '../../../shared/types/common.types';

interface PayablesHeaderProps {
  canCreate: boolean;
  onCreate: () => void;
  onNavigate?: (item: NavItem) => void;
}

export default function PayablesHeader({ canCreate, onCreate, onNavigate }: PayablesHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant">
        <span>Gestao Financeira</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-primary">Contas a pagar</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Contas a pagar</h1>
          <p className="mt-1 text-on-secondary-container">
            Controle vencimentos, baixas e atrasos sem perder o contexto de cada obrigacao financeira.
          </p>
        </div>

        <div className="flex gap-3">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => onNavigate('expenses')}
              className="rounded-full border border-outline-variant bg-surface-container-low px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              Ver custos operacionais
            </button>
          ) : null}

          {canCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="rounded-full bg-primary px-6 py-2.5 font-semibold text-on-primary shadow-lg shadow-primary/15 hover:brightness-110"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova conta a pagar
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
