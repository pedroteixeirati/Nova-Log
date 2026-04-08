import React from 'react';
import { Loader2, Plus } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import Modal from '../../../components/Modal';
import { Company } from '../../companies/types/company.types';
import { Payable } from '../types/payable.types';
import { Vehicle } from '../../vehicles/types/vehicle.types';
import { PayableFormData } from '../hooks/usePayableForm';

interface PayableFormModalProps {
  isOpen: boolean;
  editing: boolean;
  submitError: string;
  formData: PayableFormData;
  isSubmitting: boolean;
  vehicles: Vehicle[];
  companies: Company[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (next: PayableFormData) => void;
}

function inputClassName() {
  return 'w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/20';
}

export default function PayableFormModal({
  isOpen,
  editing,
  submitError,
  formData,
  isSubmitting,
  vehicles,
  companies,
  onClose,
  onSubmit,
  onChange,
}: PayableFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar conta a pagar' : 'Nova conta a pagar'}>
      <form onSubmit={onSubmit} className="space-y-6">
        {submitError ? (
          <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-medium text-error">
            {submitError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Descricao</label>
            <input
              required
              className={inputClassName()}
              value={formData.description}
              onChange={(event) => onChange({ ...formData, description: event.target.value })}
              placeholder="Ex: Manutencao preventiva"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Fornecedor</label>
            <input
              className={inputClassName()}
              value={formData.providerName}
              onChange={(event) => onChange({ ...formData, providerName: event.target.value })}
              placeholder="Ex: Oficina Diesel Centro"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Origem</label>
            <CustomSelect
              value={formData.sourceType}
              onChange={(value) =>
                onChange({
                  ...formData,
                  sourceType: value as PayableFormData['sourceType'],
                  sourceId: value === 'manual' ? '' : formData.sourceId,
                })
              }
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'expense', label: 'Custo operacional' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">ID da origem</label>
            <input
              className={inputClassName()}
              value={formData.sourceId}
              onChange={(event) => onChange({ ...formData, sourceId: event.target.value })}
              placeholder="UUID do custo operacional"
              disabled={formData.sourceType === 'manual'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Veiculo</label>
            <CustomSelect
              value={formData.vehicleId}
              onChange={(value) => onChange({ ...formData, vehicleId: value })}
              placeholder="Nao vincular"
              options={vehicles.map((vehicle) => ({
                value: vehicle.id,
                label: `${vehicle.name} (${vehicle.plate})`,
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Empresa</label>
            <CustomSelect
              value={formData.contractId}
              onChange={(value) => onChange({ ...formData, contractId: value })}
              placeholder="Nao vincular"
              options={companies.map((company) => ({
                value: company.id,
                label: company.tradeName,
              }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Valor</label>
            <input
              required
              type="number"
              step="0.01"
              className={inputClassName()}
              value={String(formData.amount)}
              onChange={(event) => onChange({ ...formData, amount: Number(event.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Vencimento</label>
            <input
              required
              type="date"
              className={inputClassName()}
              value={formData.dueDate}
              onChange={(event) => onChange({ ...formData, dueDate: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</label>
            <CustomSelect
              value={formData.status}
              onChange={(value) => onChange({ ...formData, status: value as Payable['status'] })}
              options={[
                { value: 'open', label: 'Em aberto' },
                { value: 'paid', label: 'Paga' },
                { value: 'overdue', label: 'Em atraso' },
                { value: 'canceled', label: 'Cancelada' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Data do pagamento</label>
            <input
              type="date"
              className={inputClassName()}
              value={formData.paidAt}
              onChange={(event) => onChange({ ...formData, paidAt: event.target.value })}
              disabled={formData.status !== 'paid'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Forma de pagamento</label>
            <input
              className={inputClassName()}
              value={formData.paymentMethod}
              onChange={(event) => onChange({ ...formData, paymentMethod: event.target.value })}
              placeholder="Ex: PIX, boleto, transferencia"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Comprovante (URL)</label>
            <input
              className={inputClassName()}
              value={formData.proofUrl}
              onChange={(event) => onChange({ ...formData, proofUrl: event.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Observacoes</label>
            <textarea
              className={`${inputClassName()} min-h-[110px] resize-none`}
              value={formData.notes}
              onChange={(event) => onChange({ ...formData, notes: event.target.value })}
              placeholder="Contexto financeiro, acordo com fornecedor, observacoes de pagamento..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-8 py-3 font-bold text-on-surface-variant hover:bg-surface-container"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {editing ? 'Salvar alteracoes' : 'Criar conta a pagar'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
