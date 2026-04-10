import React from 'react';
import { Edit2, Package, Trash2 } from 'lucide-react';
import { Cargo } from '../types/cargo.types';

interface CargasTableProps {
  cargas: Cargo[];
  loading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (cargo: Cargo) => void;
  onDelete: (id: string) => void;
}

function cargoStatusLabel(status: Cargo['status']) {
  switch (status) {
    case 'loading':
      return 'Carregando';
    case 'in_transit':
      return 'Em transito';
    case 'delivered':
      return 'Entregue';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Planejada';
  }
}

function cargoStatusTone(status: Cargo['status']) {
  switch (status) {
    case 'loading':
      return 'bg-secondary-container text-on-secondary-container';
    case 'in_transit':
      return 'bg-primary-fixed text-primary';
    case 'delivered':
      return 'bg-tertiary-container text-on-tertiary-container';
    case 'cancelled':
      return 'bg-error/10 text-error';
    default:
      return 'bg-surface-container text-on-surface';
  }
}

export default function CargasTable({
  cargas,
  loading,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: CargasTableProps) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-outline-variant/30 bg-surface-container-lowest p-10 text-center text-on-surface-variant">
        Carregando cargas...
      </div>
    );
  }

  if (cargas.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-outline-variant/60 bg-surface-container-lowest p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-outline/60">
          <Package className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-on-surface">Nenhuma carga encontrada</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Cadastre a primeira carga para acompanhar a operacao vinculada aos fretes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant/20">
          <thead className="bg-surface-container-low">
            <tr className="text-left text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-5 py-4">Carga</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Frete</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Origem / Destino</th>
              <th className="px-5 py-4">Peso</th>
              <th className="px-5 py-4">Valor</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {cargas.map((cargo) => (
              <tr key={cargo.id} className="align-top text-sm text-on-surface">
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="font-bold">{cargo.cargoNumber || `Carga #${cargo.displayId ?? cargo.id.slice(0, 6)}`}</div>
                    <div className="text-xs text-on-surface-variant">{cargo.description}</div>
                  </div>
                </td>
                <td className="px-5 py-4">{cargo.companyName || '-'}</td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="font-semibold">{cargo.freightDisplayId ? `Frete #${cargo.freightDisplayId}` : 'Frete vinculado'}</div>
                    <div className="text-xs text-on-surface-variant">{cargo.freightRoute || '-'}</div>
                  </div>
                </td>
                <td className="px-5 py-4">{cargo.cargoType}</td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div>{cargo.origin}</div>
                    <div className="text-xs text-on-surface-variant">{cargo.destination}</div>
                  </div>
                </td>
                <td className="px-5 py-4">{cargo.weight ? `${cargo.weight} kg` : '-'}</td>
                <td className="px-5 py-4">
                  {cargo.merchandiseValue
                    ? cargo.merchandiseValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : '-'}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${cargoStatusTone(cargo.status)}`}>
                    {cargoStatusLabel(cargo.status)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    {canUpdate ? (
                      <button
                        type="button"
                        aria-label={`Editar carga ${cargo.cargoNumber || cargo.description}`}
                        onClick={() => onEdit(cargo)}
                        className="rounded-full p-2 text-outline transition hover:bg-surface-container hover:text-on-surface"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        aria-label={`Excluir carga ${cargo.cargoNumber || cargo.description}`}
                        onClick={() => onDelete(cargo.id)}
                        className="rounded-full p-2 text-outline transition hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
