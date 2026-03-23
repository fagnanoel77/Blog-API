import { z } from 'zod';

export const createArticleSchema = z
  .object({
    title: z.string().trim().min(3),
    content: z.string().trim().min(1),

    userId: z.number().int().positive().optional(),
    userName: z.string().trim().min(1).optional(),

    categories: z.array(z.string().trim().min(1).toLowerCase()).optional(),

    tags: z.array(z.string().trim().min(1).toLowerCase()).optional(),
  })
  .refine((data) => data.userId || data.userName, {
    message: 'Either userId or userName must be provided',
  });

export const idParamSchema = z.object({
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: 'Invalid ID',
    }),
});

export const updateArticleSchema = z
  .object({
    title: z.string().trim().min(3).optional(),
    content: z.string().trim().min(1).optional(),

    categories: z.array(z.string().trim().min(1).toLowerCase()).optional(),

    tags: z.array(z.string().trim().min(1).toLowerCase()).optional(),
  })
  .refine(
    (data) => data.title || data.content || data.categories || data.tags,
    {
      message: 'At least one field must be provided for update',
    },
  );

export const searchSchema = z.object({
  q: z.string().trim().min(1),
});

export const filterSchema = z
  .object({
    userName: z.string().trim().optional(),

    categories: z
      .string()
      .optional()
      .transform((val) =>
        val ? val.split(',').map((c) => c.trim().toLowerCase()) : undefined,
      ),

    tags: z
      .string()
      .optional()
      .transform((val) =>
        val ? val.split(',').map((t) => t.trim().toLowerCase()) : undefined,
      ),

    date: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;

        const start = new Date(val);
        start.setHours(0, 0, 0, 0);

        const end = new Date(val);
        end.setHours(23, 59, 59, 999);

        return { start, end };
      }),
  })
  .refine(
    (data) => data.userName || data.categories || data.tags || data.date,
    {
      message: 'At least one filter must be provided',
    },
  );
