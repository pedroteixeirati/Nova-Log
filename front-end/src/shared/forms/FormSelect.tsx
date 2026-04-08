import React from 'react';
import { Controller, FieldValues, Path, Control } from 'react-hook-form';
import Select, { CustomSelectOption } from '../ui/Select';
import FormFieldError from './FormFieldError';

interface FormSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  error?: string;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
}

export default function FormSelect<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  error,
  options,
  placeholder,
  disabled,
  containerClassName,
}: FormSelectProps<TFieldValues>) {
  return (
    <div className={containerClassName ?? 'space-y-2'}>
      {label ? (
        <label className="block pl-1 text-xs font-medium uppercase tracking-[0.18em] text-on-surface">
          {label}
        </label>
      ) : null}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            buttonClassName={error ? 'border-error/35 focus:ring-error/20' : undefined}
          />
        )}
      />
      <FormFieldError message={error} />
    </div>
  );
}
