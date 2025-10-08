
import { z } from 'zod';

export const createCheckpointSchema = z.object({
  body: z.object({
    unitId: z.string().uuid('Invalid unitId format'),
    status: z.string().min(1, 'Status cannot be empty'),
    timestamp: z.string().datetime('Invalid timestamp format'),
  }),
});

export const getHistorySchema = z.object({
  query: z.object({
    unitId: z.string().uuid('Invalid unitId format'),
  }),
});
