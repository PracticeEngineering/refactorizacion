import { Checkpoint } from "../../domain/entities/Checkpoint.js";
import { ICheckpointRepository } from "./ICheckpointRepository.js";

export class InMemoryCheckpointRepository implements ICheckpointRepository {
    private checkpoints: Map<string, Checkpoint> = new Map();

    async save(checkpoint: Checkpoint): Promise<void> {
        this.checkpoints.set(checkpoint.id, checkpoint);
    }

    async findById(id: string): Promise<Checkpoint | null> {
        const checkpoint = this.checkpoints.get(id);
        return checkpoint ? checkpoint : null;
    }

    async findByUnitId(unitId: string): Promise<Checkpoint[]> {
        return Array.from(this.checkpoints.values()).filter(
            (checkpoint) => checkpoint.unitId === unitId
        );
    }
}
