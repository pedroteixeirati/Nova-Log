import React from 'react';
import { PackagePlus } from 'lucide-react';

interface CargasHeaderProps {
  canCreate: boolean;
  onCreate: () => void;
}

export default function CargasHeader({ canCreate, onCreate }: CargasHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-primary">
          Operacao
        </span>
        <div>
          <h1 className="text-3xl font-black text-on-surface">Cargas</h1>
          <p className="text-sm text-on-surface-variant">
            Controle as cargas vinculadas aos fretes e acompanhe a operacao por cliente, rota e status.
          </p>
        </div>
      </div>

      {canCreate ? (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:scale-[1.01] active:scale-95"
        >
          <PackagePlus className="h-4 w-4" />
          Nova carga
        </button>
      ) : null}
    </div>
  );
}
