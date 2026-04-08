import React from 'react';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import Input from '../ui/Input';

interface FormInputProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<typeof Input>, 'name' | 'error'> {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  error?: string;
}

export default function FormInput<TFieldValues extends FieldValues>({
  name,
  register,
  error,
  ...props
}: FormInputProps<TFieldValues>) {
  return <Input {...register(name)} {...props} error={error} />;
}
