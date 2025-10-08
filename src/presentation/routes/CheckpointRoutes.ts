
import { Router } from 'express';
import { CreateCheckpointController } from '../controllers/CreateCheckpointController.js';
import { GetHistoryByUnitIdController } from '../controllers/GetHistoryByUnitIdController.js';
import { validate } from '../middlewares/ValidationMiddleware.js';
import { createCheckpointSchema, getHistorySchema } from '../validators/CheckpointValidator.js';
import { CreateCheckpointUseCase } from '../../application/use-cases/CreateCheckpointUseCase.js';
import { GetHistoryByUnitIdUseCase } from '../../application/use-cases/GetHistoryByUnitIdUseCase.js';
import { InMemoryCheckpointRepository } from '../../infrastructure/repositories/InMemoryCheckpointRepository.js';
import { InMemoryUnitRepository } from '../../infrastructure/repositories/InMemoryUnitRepository.js';

const router = Router();

const checkpointRepository = new InMemoryCheckpointRepository();
const unitRepository = new InMemoryUnitRepository();

const createCheckpointUseCase = new CreateCheckpointUseCase(checkpointRepository, unitRepository);
const getHistoryByUnitIdUseCase = new GetHistoryByUnitIdUseCase(checkpointRepository);

const createCheckpointController = new CreateCheckpointController(createCheckpointUseCase);
const getHistoryByUnitIdController = new GetHistoryByUnitIdController(getHistoryByUnitIdUseCase);

router.post(
    '/checkpoint',
    validate(createCheckpointSchema),
    (req, res, next) => createCheckpointController.handle(req, res, next)
);

router.get(
    '/history',
    validate(getHistorySchema),
    (req, res, next) => getHistoryByUnitIdController.handle(req, res, next)
);

export { router as checkpointRouter };
