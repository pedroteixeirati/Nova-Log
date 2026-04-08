import React from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';
import KpiCard from '../../../components/KpiCard';

interface PayablesStatsProps {
  totalFiltered: number;
  totalOpen: number;
  totalPaid: number;
  totalOverdue: number;
}

function currency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

export default function PayablesStats({
  totalFiltered,
  totalOpen,
  totalPaid,
  totalOverdue,
}: PayablesStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Compromissos filtrados" value={currency(totalFiltered)} icon={CreditCard} tone="primary" />
      <KpiCard label="Em aberto" value={currency(totalOpen)} tone="warning" />
      <KpiCard label="Pagas" value={currency(totalPaid)} tone="success" />
      <KpiCard label="Em atraso" value={currency(totalOverdue)} icon={AlertTriangle} tone="danger" />
    </div>
  );
}
