import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, FileText } from 'lucide-react';
import Modal from '../../../components/Modal';
import { formatDateOnlyPtBr } from '../../../lib/date';
import { NovalogBilling, NovalogBillingItem } from '../types/novalog-billing.types';
import { formatNovalogCurrency } from '../utils/novalog.calculations';
import { novalogBillingItemStatusLabel, novalogBillingStatusClass, novalogBillingStatusLabel } from '../utils/novalog-billing-status';

interface NovalogBillingDetailsModalProps {
  isOpen: boolean;
  billing: NovalogBilling | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onCloseBilling: (billing: NovalogBilling) => void;
  onEdit: (billing: NovalogBilling) => void;
  onReceiveItem: (itemId: string) => void;
  onOverdueItem: (itemId: string) => void;
  onCancelItem: (itemId: string) => void;
  onOpenRevenue?: (item: NovalogBillingItem) => void;
}

export default function NovalogBillingDetailsModal({
  isOpen,
  billing,
  isSubmitting = false,
  onClose,
  onCloseBilling,
  onEdit,
  onReceiveItem,
  onOverdueItem,
  onCancelItem,
  onOpenRevenue,
}: NovalogBillingDetailsModalProps) {
  if (!billing) return null;
  const items = billing.items ?? [];
  const canOperateItems = billing.status !== 'draft' && billing.status !== 'canceled';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Faturamento ${billing.displayId ? `#${billing.displayId}` : 'Novalog'}`}
      panelClassName="max-w-[min(94vw,1320px)]"
      contentClassName="xl:px-6"
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <article className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Cliente</p>
            <p className="mt-2 text-sm font-black text-on-surface">{billing.companyName}</p>
          </article>
          <article className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Vencimento</p>
            <p className="mt-2 text-sm font-black text-on-surface">{formatDateOnlyPtBr(billing.dueDate)}</p>
          </article>
          <article className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Total</p>
            <p className="mt-2 text-sm font-black text-primary">{formatNovalogCurrency(billing.totalAmount)}</p>
          </article>
          <article className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Status</p>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${novalogBillingStatusClass(billing.status)}`}>
              {novalogBillingStatusLabel(billing.status)}
            </span>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Recebido</p>
            </div>
            <p className="mt-2 text-lg font-black text-on-surface">{formatNovalogCurrency(billing.receivedAmount)}</p>
          </article>
          <article className="rounded-[1.5rem] border border-tertiary/15 bg-tertiary/5 p-4">
            <div className="flex items-center gap-2 text-tertiary">
              <Clock className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Em aberto</p>
            </div>
            <p className="mt-2 text-lg font-black text-on-surface">{formatNovalogCurrency(billing.openAmount)}</p>
          </article>
          <article className="rounded-[1.5rem] border border-error/15 bg-error/5 p-4">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Em atraso</p>
            </div>
            <p className="mt-2 text-lg font-black text-on-surface">{formatNovalogCurrency(billing.overdueAmount)}</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-[1.8rem] border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/10 bg-surface-container-low px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-on-surface">CT-es</h3>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">{items.length} item(ns)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">CT-e</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Emissao</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant text-right">Valor</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant text-center">Status</th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant text-center">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 text-sm font-bold text-on-surface">{item.cteNumber}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{item.issueDate ? formatDateOnlyPtBr(item.issueDate) : '-'}</td>
                    <td className="px-5 py-4 text-right text-sm font-black text-primary">{formatNovalogCurrency(item.amount)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${novalogBillingStatusClass(item.status)}`}>
                        {novalogBillingItemStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-[260px] items-center justify-center gap-2">
                        {canOperateItems && item.status !== 'received' && item.status !== 'canceled' ? (
                          <button type="button" disabled={isSubmitting} onClick={() => onReceiveItem(item.id)} className="rounded-full bg-secondary-container px-3 py-2 text-[11px] font-bold text-on-secondary-container disabled:opacity-60">
                            Recebida
                          </button>
                        ) : null}
                        {canOperateItems && item.status !== 'overdue' && item.status !== 'received' && item.status !== 'canceled' ? (
                          <button type="button" disabled={isSubmitting} onClick={() => onOverdueItem(item.id)} className="rounded-full bg-error/10 px-3 py-2 text-[11px] font-bold text-error disabled:opacity-60">
                            Em atraso
                          </button>
                        ) : null}
                        {canOperateItems && item.status !== 'canceled' && item.status !== 'received' ? (
                          <button type="button" disabled={isSubmitting} onClick={() => onCancelItem(item.id)} className="rounded-full border border-outline-variant bg-surface px-3 py-2 text-[11px] font-bold text-on-surface-variant disabled:opacity-60">
                            Cancelar
                          </button>
                        ) : null}
                        {item.linkedRevenueId ? (
                          <button
                            type="button"
                            onClick={() => onOpenRevenue?.(item)}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!onOpenRevenue}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Recebivel
                          </button>
                        ) : null}
                        {!canOperateItems ? (
                          <span className="text-xs font-medium text-on-surface-variant">Feche para baixar</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-outline-variant/10 pt-5 sm:flex-row sm:justify-end">
          {billing.status === 'draft' ? (
            <button type="button" onClick={() => onEdit(billing)} disabled={isSubmitting || !billing.items} className="rounded-full border border-outline-variant bg-surface px-5 py-3 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:bg-primary/5 disabled:opacity-60">
              Editar
            </button>
          ) : null}
          {billing.status === 'draft' ? (
            <button type="button" onClick={() => onCloseBilling(billing)} disabled={isSubmitting} className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:scale-[1.01] active:scale-95 disabled:opacity-60">
              Fechar e gerar recebiveis
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="rounded-full border border-outline-variant bg-surface px-5 py-3 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:bg-primary/5">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
