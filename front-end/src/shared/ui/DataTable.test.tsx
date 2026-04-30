import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DataTable, { DataTableColumn } from './DataTable';

type Row = {
  id: string;
  name: string;
  amount: string;
};

const columns: Array<DataTableColumn<Row>> = [
  { id: 'name', header: 'Nome', cell: (row) => row.name },
  { id: 'amount', header: 'Valor', cell: (row) => row.amount, className: 'text-right' },
];

describe('DataTable', () => {
  it('renderiza toolbar, linhas e paginacao', () => {
    const onPreviousPage = vi.fn();
    const onNextPage = vi.fn();

    render(
      <DataTable
        rows={[{ id: '1', name: 'Conta teste', amount: 'R$ 10,00' }]}
        columns={columns}
        getRowKey={(row) => row.id}
        toolbar={<label htmlFor="search">Buscar</label>}
        summary="Mostrando 1 resultado"
        pagination={{
          currentPage: 1,
          totalPages: 2,
          onPreviousPage,
          onNextPage,
        }}
      />,
    );

    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Conta teste')).toBeInTheDocument();
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1 resultado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /proxima pagina/i }));
    expect(onNextPage).toHaveBeenCalledTimes(1);
    expect(onPreviousPage).not.toHaveBeenCalled();
  });

  it('renderiza estados de loading e vazio', () => {
    const { rerender } = render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowKey={(row) => row.id}
        loading
        loadingLabel="Carregando registros..."
      />,
    );

    expect(screen.getByText('Carregando registros...')).toBeInTheDocument();

    rerender(
      <DataTable
        rows={[]}
        columns={columns}
        getRowKey={(row) => row.id}
        emptyLabel="Nada encontrado."
      />,
    );

    expect(screen.getByText('Nada encontrado.')).toBeInTheDocument();
  });
});
