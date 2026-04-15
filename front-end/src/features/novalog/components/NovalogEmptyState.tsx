import React from 'react';
import { Layers3, PackagePlus, Pickaxe } from 'lucide-react';

interface NovalogEmptyStateProps {
  onOpenStandard: () => void;
  onOpenBatch: () => void;
}

export default function NovalogEmptyState({ onOpenStandard, onOpenBatch }: NovalogEmptyStateProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-outline-variant/10 px-6 py-7 lg:border-b-0 lg:border-r lg:px-8 lg:py-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <Pickaxe className="h-3.5 w-3.5" />
            Operação Novalog
          </span>
          <h2 className="mt-4 max-w-xl text-2xl font-black tracking-tight text-on-surface sm:text-[2rem]">
            Lance operações semanais por mineradora sem depender mais da planilha.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-[15px]">
            Esta primeira etapa prepara o módulo com entrada padrão e por lote. O foco agora é organizar a experiência,
            manter a identidade do Fretsoft e deixar a operação da Novalog pronta para crescer.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onOpenStandard}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:scale-[1.01] active:scale-95"
            >
              <PackagePlus className="h-4 w-4" />
              Novo lançamento
            </button>
            <button
              type="button"
              onClick={onOpenBatch}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface px-6 py-3 text-sm font-bold text-on-surface transition hover:border-primary/25 hover:bg-primary/5"
            >
              <Layers3 className="h-4 w-4 text-primary" />
              Novo lote
            </button>
          </div>
        </div>

        <div className="px-6 py-7 lg:px-8 lg:py-9">
          <div className="rounded-[1.6rem] border border-primary/12 bg-primary/5 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Próxima camada</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-on-surface-variant">
              <li>Entrada padrão para registros pontuais.</li>
              <li>Lançamento por lote com origem compartilhada.</li>
              <li>Tabela semanal com filtros e cards de totais.</li>
              <li>Integração posterior com backend e fórmulas da Novalog.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
