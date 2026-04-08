import { DefaultValues, FieldValues, UseFormProps, UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType, input } from 'zod';

type UseZodFormOptions<TSchema extends ZodType> = Omit<
  UseFormProps<input<TSchema>>,
  'resolver' | 'defaultValues'
> & {
  schema: TSchema;
  defaultValues: DefaultValues<input<TSchema>>;
};

export function useZodForm<TSchema extends ZodType>({
  schema,
  defaultValues,
  ...options
}: UseZodFormOptions<TSchema>): UseFormReturn<input<TSchema>> {
  return useForm<input<TSchema>>({
    resolver: zodResolver(schema) as UseFormProps<input<TSchema>>['resolver'],
    defaultValues,
    mode: 'onBlur',
    ...options,
  });
}

export type AnyFieldValues = FieldValues;
