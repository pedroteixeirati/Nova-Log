import React, { useEffect, useMemo, useState } from 'react';
import { Building2, FileText, Filter, Loader2, MoreVertical, RefreshCw, Search, Wallet } from 'lucide-react';
import { revenuesApi } from '../lib/api';
import { Revenue } from '../types';

function currency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

export default function Revenues() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingRevenueId, setProcessingRevenueId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      setRevenues(await revenuesApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await revenuesApi.generate();
      await loadData();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCharge = async (revenueId: string) => {
    setProcessingRevenueId(revenueId);
    try {
      await revenuesApi.generateCharge(revenueId);
      await loadData();
    } finally {
      setProcessingRevenueId(null);
    }
  };

  const handleReceive = async (revenueId: string) => {
    setProcessingRevenueId(revenueId);
    try {
      await revenuesApi.markReceived(revenueId);
      await loadData();
    } finally {
      setProcessingRevenueId(null);
    }
  };

  const handleOverdue = async (revenueId: string) => {
    setProcessingRevenueId(revenueId);
    try {
      await revenuesApi.markOverdue(revenueId);
      await loadData();
    } finally {
      setProcessingRevenueId(null);
    }
  };

  const filteredRevenues = useMemo(
    () =>
      revenues.filter((revenue) => {
        const matchesSearch =
          revenue.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          revenue.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          revenue.competenceLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (revenue.chargeReference || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || revenue.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [revenues, searchTerm, statusFilter]
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Gestao de Receitas</h1>
          <p className="text-on-secondary-container mt-2">
            Acompanhe as receitas geradas por contratos e fretes avulsos no mesmo fluxo financeiro.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-primary text-on-primary rounded-full px-6 py-2.5 font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          ATUALIZAR RECEITAS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-surface-container-lowest rounded-xl p-2 flex items-center shadow-sm focus-within:shadow-md transition-shadow">
            <Search className="w-5 h-5 text-outline ml-3" />
            <input
              type="text"
              placeholder="Buscar por empresa, contrato, competencia ou referencia..."
              className="w-full border-none focus:ring-0 bg-transparent text-on-surface text-sm py-2 px-4 placeholder:text-outline/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="h-6 w-px bg-outline/20 mx-2" />
            <div className="flex items-center gap-2 px-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-primary text-sm font-semibold appearance-none cursor-pointer focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="billed">Cobrada</option>
                <option value="received">Recebida</option>
                <option value="overdue">Em atraso</option>
                <option value="canceled">Cancelada</option>
              </select>
              <Filter className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 bg-surface-container-low rounded-xl p-1">
          <div className="bg-surface-container-lowest rounded-lg p-6 h-full min-h-[420px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-lg text-on-surface">Lancamentos de Receita</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-on-surface-variant font-medium">Carregando receitas...</p>
              </div>
            ) : filteredRevenues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-outline/40 mb-4">
                  <Wallet className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-on-surface">Nenhuma receita encontrada</h4>
                <p className="text-on-surface-variant max-w-xs mt-2">
                  Gere as receitas ou ajuste os filtros para visualizar os registros.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRevenues.map((revenue) => (
                  <div key={revenue.id} className="group flex items-center p-3 rounded-xl hover:bg-primary-fixed-dim/10 transition-all">
                    <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold font-headline text-on-surface">{revenue.contractName}</span>
                        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                          {revenue.sourceType === 'freight' ? 'Frete avulso' : revenue.competenceLabel}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${statusBadgeTone(revenue.status)}`}>
                          {statusLabel(revenue.status)}
                        </span>
                      </div>
                      <p className="text-xs text-on-secondary-container flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {revenue.companyName}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        Vencimento: {new Date(`${revenue.dueDate}T00:00:00`).toLocaleDateString('pt-BR')}
                        {revenue.chargeReference ? ` • Ref: ${revenue.chargeReference}` : ''}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right mr-6">
                      <span className="text-sm font-bold text-on-surface">{currency(Number(revenue.amount || 0))}</span>
                      <p className="text-[10px] text-on-secondary-container uppercase">
                        {revenue.sourceType === 'freight' ? 'Receita de frete' : 'Receita mensal'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {revenue.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCharge(revenue.id)}
                          disabled={processingRevenueId === revenue.id}
                          className="rounded-full bg-primary px-3 py-2 text-[11px] font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:opacity-50"
                        >
                          Gerar cobranca
                        </button>
                      )}
                      {(revenue.status === 'pending' || revenue.status === 'billed' || revenue.status === 'overdue') && (
                        <button
                          type="button"
                          onClick={() => handleReceive(revenue.id)}
                          disabled={processingRevenueId === revenue.id}
                          className="rounded-full bg-secondary-container px-3 py-2 text-[11px] font-bold text-on-secondary-container transition-colors hover:opacity-90 disabled:opacity-50"
                        >
                          Recebida
                        </button>
                      )}
                      {(revenue.status === 'pending' || revenue.status === 'billed') && (
                        <button
                          type="button"
                          onClick={() => handleOverdue(revenue.id)}
                          disabled={processingRevenueId === revenue.id}
                          className="rounded-full bg-error/10 px-3 py-2 text-[11px] font-bold text-error transition-colors hover:bg-error/15 disabled:opacity-50"
                        >
                          Em atraso
                        </button>
                      )}
                      <button
                        type="button"
                        className="p-2 text-outline hover:text-on-surface transition-colors"
                        aria-label="Mais opcoes"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: Revenue['status']) {
  switch (status) {
    case 'billed':
      return 'Cobrada';
    case 'received':
      return 'Recebida';
    case 'overdue':
      return 'Em atraso';
    case 'canceled':
      return 'Cancelada';
    default:
      return 'Pendente';
  }
}

function statusBadgeTone(status: Revenue['status']) {
  switch (status) {
    case 'billed':
      return 'bg-secondary-container text-on-secondary-container';
    case 'received':
      return 'bg-primary-fixed text-primary';
    case 'overdue':
      return 'bg-error/10 text-error';
    case 'canceled':
      return 'bg-surface-container text-on-surface-variant';
    default:
      return 'bg-tertiary/10 text-tertiary';
  }
}
