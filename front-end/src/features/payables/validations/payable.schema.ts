import { z } from 'zod';

export const payableSchema = z.object({
  sourceType: z.enum(['manual', 'expense']).default('manual'),
  sourceId: z.string().optional().default(''),
  description: z.string().trim().min(1, 'Informe a descricao da conta a pagar.'),
  providerName: z.string().optional().default(''),
  vehicleId: z.string().optional().default(''),
  contractId: z.string().optional().default(''),
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  dueDate: z.string().min(1, 'Informe a data de vencimento.'),
  status: z.enum(['open', 'paid', 'overdue', 'canceled']).default('open'),
  paidAt: z.string().optional().default(''),
  paymentMethod: z.string().optional().default(''),
  proofUrl: z.string().optional().default(''),
  notes: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  if (data.sourceType === 'expense' && !data.sourceId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sourceId'],
      message: 'Informe o ID da origem quando a conta vier de custo operacional.',
    });
  }

  if (data.status === 'paid' && !data.paidAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paidAt'],
      message: 'Informe a data do pagamento quando a conta estiver paga.',
    });
  }
});

export type PayableFormValues = z.input<typeof payableSchema>;
