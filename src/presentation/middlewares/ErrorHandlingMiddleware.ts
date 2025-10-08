
import { Request, Response, NextFunction } from 'express';
import { DuplicateRequestException } from '../../domain/exceptions/DuplicateRequestException.js';
import { InvalidStatusException } from '../../domain/exceptions/InvalidStatusException.js';

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Handle duplicate request (idempotency)
  if (err instanceof DuplicateRequestException) {
    return res.status(409).json({ message: err.message });
  }

  // Handle invalid status
  if (err instanceof InvalidStatusException) {
    return res.status(400).json({ message: err.message });
  }

  // Default to a 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';

  res.status(statusCode).json({ message });
};
