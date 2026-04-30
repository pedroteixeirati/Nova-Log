import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

interface DataTablePagination {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowKey: (row: T) => string;
  loading?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  summary?: React.ReactNode;
  toolbar?: React.ReactNode;
  pagination?: DataTablePagination;
  renderMobileRow?: (row: T) => React.ReactNode;
  className?: string;
}

export default function DataTable<T>({
  rows,
  columns,
  getRowKey,
  loading = false,
  loadingLabel = 'Carregando dados...',
  emptyLabel = 'Nenhum registro encontrado.',
  summary,
  toolbar,
  pagination,
  renderMobileRow,
  className,
}: DataTableProps<T>) {
  return (
    <section className={cn('overflow-hidden rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-lowest shadow-sm', className)}>
      {toolbar ? (
        <div className="border-b border-outline-variant/10 bg-surface-container-low/40 px-4 py-4 sm:px-5">
          {toolbar}
        </div>
      ) : null}

      {renderMobileRow && !loading && rows.length > 0 ? (
        <div className="space-y-3 p-3 md:hidden">
          {rows.map((row) => (
            <React.Fragment key={getRowKey(row)}>{renderMobileRow(row)}</React.Fragment>
          ))}
        </div>
      ) : null}

      <div className={cn(renderMobileRow && !loading && rows.length > 0 ? 'hidden md:block' : 'block', 'overflow-x-auto')}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-low">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-on-surface-variant">{loadingLabel}</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center text-sm text-on-surface-variant">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={getRowKey(row)} className="transition-colors hover:bg-primary-fixed-dim/5">
                  {columns.map((column) => (
                    <td key={column.id} className={cn('px-5 py-3 align-middle', column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-outline-variant/10 bg-surface-container-low/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-on-surface-variant">{summary}</p>
        {pagination ? (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Pagina anterior"
              onClick={pagination.onPreviousPage}
              disabled={pagination.currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-container disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Pagina ${pagination.currentPage}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary"
            >
              {pagination.currentPage}
            </button>
            <button
              type="button"
              aria-label="Proxima pagina"
              onClick={pagination.onNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-container disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
