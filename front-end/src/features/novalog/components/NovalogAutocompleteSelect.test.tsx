import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NovalogAutocompleteSelect from './NovalogAutocompleteSelect';

describe('NovalogAutocompleteSelect', () => {
  const options = [
    { value: 'Gerdau', label: 'Gerdau' },
    { value: 'ArcelorMittal', label: 'ArcelorMittal' },
  ];

  it('mantem sugestoes e aceita destino digitado manualmente', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function TestHarness() {
      const [value, setValue] = React.useState('');

      return (
        <NovalogAutocompleteSelect
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
            handleChange(nextValue);
          }}
          options={options}
          placeholder="Destino"
        />
      );
    }

    render(<TestHarness />);

    const input = screen.getByPlaceholderText('Destino');

    await user.click(input);
    await user.type(input, 'Usiminas');
    await user.click(document.body);

    expect(handleChange).toHaveBeenLastCalledWith('Usiminas');
    expect(screen.getByDisplayValue('Usiminas')).toBeInTheDocument();
  });

  it('continua permitindo selecionar um destino sugerido', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <NovalogAutocompleteSelect
        value=""
        onChange={handleChange}
        options={options}
        placeholder="Destino"
      />,
    );

    const input = screen.getByPlaceholderText('Destino');

    await user.click(input);
    await user.type(input, 'Ger');
    await user.click(screen.getByRole('button', { name: 'Gerdau' }));

    expect(handleChange).toHaveBeenLastCalledWith('Gerdau');
  });

  it('seleciona a sugestao destacada com Tab e mantem a navegacao do formulario', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function TestHarness() {
      const [value, setValue] = React.useState('');

      return (
        <>
          <NovalogAutocompleteSelect
            value={value}
            onChange={(nextValue) => {
              setValue(nextValue);
              handleChange(nextValue);
            }}
            options={options}
            placeholder="Destino"
          />
          <input aria-label="Proximo campo" />
        </>
      );
    }

    render(<TestHarness />);

    const input = screen.getByPlaceholderText('Destino');
    const nextInput = screen.getByLabelText('Proximo campo');

    await user.click(input);
    await user.type(input, 'Ger');
    await user.tab();

    await waitFor(() => expect(handleChange).toHaveBeenLastCalledWith('Gerdau'));
    expect(nextInput).toHaveFocus();
  });
});
