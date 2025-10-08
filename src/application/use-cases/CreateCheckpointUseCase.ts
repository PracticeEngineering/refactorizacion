
import { Checkpoint } from "../../domain/entities/Checkpoint.js";
import { ICheckpointRepository } from "../../infrastructure/repositories/ICheckpointRepository.js";
import { IUnitRepository } from "../../infrastructure/repositories/IUnitRepository.js";
import { Unit } from "../../domain/entities/Unit.js";

export class CreateCheckpointUseCase {
    constructor(
        private checkpointRepository: ICheckpointRepository,
        private unitRepository: IUnitRepository
    ) {}

    async execute(unitId: string, status: string, timestamp: Date): Promise<Checkpoint> {
        const checkpoint = new Checkpoint(unitId, status, timestamp);
        await this.checkpointRepository.save(checkpoint);

        let unit = await this.unitRepository.findById(unitId);
        if (!unit) {
            unit = new Unit(unitId, status);
        } else {
            unit.updateStatus(status);
        }
        await this.unitRepository.save(unit);

        return checkpoint;
    }
}
