
import { Request, Response, NextFunction } from 'express';
import { GetHistoryByUnitIdUseCase } from '../../application/use-cases/GetHistoryByUnitIdUseCase.js';

export class GetHistoryByUnitIdController {
  constructor(private getHistoryByUnitIdUseCase: GetHistoryByUnitIdUseCase) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { unitId } = req.query as { unitId: string };
      const history = await this.getHistoryByUnitIdUseCase.execute(unitId);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }
}
