import { Checkpoint } from "../../domain/entities/Checkpoint.js";

export interface ICheckpointRepository {
    save(checkpoint: Checkpoint): Promise<void>;
    findById(id: string): Promise<Checkpoint | null>;
    findByUnitId(unitId: string): Promise<Checkpoint[]>;
}
