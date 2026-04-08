import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('Informe um e-mail valido.'),
  password: z
    .string()
    .min(1, 'Informe a senha.'),
});

export type LoginFormValues = z.input<typeof loginSchema>;
