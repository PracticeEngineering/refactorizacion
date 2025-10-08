
import { z } from 'zod';
import { VALID_STATUSES } from '../../application/dtos/index.js';

export const createCheckpointSchema = z.object({
  body: z.object({
    unitId: z.string().uuid('Invalid unitId format'),
    status: z.enum(VALID_STATUSES as [string, ...string[]], {
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
    }),
    timestamp: z.string().datetime('Invalid timestamp format'),
  }),
});

export const getHistorySchema = z.object({
  query: z.object({
    unitId: z.string().uuid('Invalid unitId format'),
  }),
});
