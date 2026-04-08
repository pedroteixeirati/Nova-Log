import { z } from 'zod';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Informe uma hora valida.');

export const expenseSchema = z.object({
  date: z.string().min(1, 'Informe a data do custo operacional.'),
  time: timeSchema,
  vehicleId: z.string().trim().min(1, 'Selecione um veiculo cadastrado.'),
  vehicleName: z.string().trim().optional().default(''),
  provider: z.string().trim().min(1, 'Selecione um fornecedor.'),
  category: z.string().trim().min(1, 'Selecione uma categoria.'),
  quantity: z.string().optional().default(''),
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  odometer: z.string().optional().default(''),
  status: z.enum(['approved', 'review', 'pending']).default('approved'),
  paymentRequired: z.boolean().default(false),
  dueDate: z.string().optional().default(''),
  linkedPayableId: z.string().nullable().optional().default(null),
  observations: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  if (data.paymentRequired && !data.dueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dueDate'],
      message: 'Informe a data de vencimento para gerar a conta a pagar.',
    });
  }
});

export type ExpenseFormValues = z.input<typeof expenseSchema>;
