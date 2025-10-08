
import { Request, Response, NextFunction } from 'express';

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Default to a 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // You can add custom error types here
  // if (err instanceof CustomError) {
  //   statusCode = err.statusCode;
  //   message = err.message;
  // }

  res.status(statusCode).json({ message });
};
