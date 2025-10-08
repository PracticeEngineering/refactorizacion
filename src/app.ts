import express from 'express';
import { checkpointRouter } from './presentation/routes/CheckpointRoutes.js';
import { errorHandlingMiddleware } from './presentation/middlewares/ErrorHandlingMiddleware.js';

const app = express();
app.use(express.json());

// Setup routes
app.use('/api', checkpointRouter);

// Setup error handling middleware
app.use(errorHandlingMiddleware);

export default app;