export * from './CreateCheckpointRequest.js';

// Re-exportar constantes de dominio necesarias para validación
// NOTA: Esto NO viola Clean Architecture porque:
// 1. Application puede conocer Domain
// 2. Presentation importa de Application, no de Domain directamente
// 3. Mantiene el flujo unidireccional de dependencias
import { VALID_STATUSES, CheckpointStatus, CheckpointStatusType } from '../../domain/enums/CheckpointStatus.js';

export { VALID_STATUSES, CheckpointStatus };
export type { CheckpointStatusType };
