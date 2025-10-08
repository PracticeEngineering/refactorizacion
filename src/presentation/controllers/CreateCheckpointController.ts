
import { Request, Response, NextFunction } from 'express';
import { CreateCheckpointUseCase } from '../../application/use-cases/CreateCheckpointUseCase.js';

export class CreateCheckpointController {
  constructor(private createCheckpointUseCase: CreateCheckpointUseCase) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { unitId, status, timestamp } = req.body;
      const checkpoint = await this.createCheckpointUseCase.execute(
        unitId,
        status,
        new Date(timestamp)
      );
      res.status(201).json(checkpoint);
    } catch (error) {
      next(error);
    }
  }
}
