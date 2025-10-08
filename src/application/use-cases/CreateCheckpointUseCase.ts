
import { Checkpoint } from "../../domain/entities/Checkpoint.js";
import { ICheckpointRepository } from "../../domain/InterfacesRepositories/ICheckpointRepository.js";
import { IUnitRepository } from "../../domain/InterfacesRepositories/IUnitRepository.js";
import { Unit } from "../../domain/entities/Unit.js";
import { DuplicateRequestException } from "../../domain/exceptions/DuplicateRequestException.js";
import { InvalidStatusException } from "../../domain/exceptions/InvalidStatusException.js";
import { isValidStatus, VALID_STATUSES } from "../../domain/enums/CheckpointStatus.js";

export class CreateCheckpointUseCase {
    constructor(
        private checkpointRepository: ICheckpointRepository,
        private unitRepository: IUnitRepository
    ) {}

    async execute(unitId: string, status: string, timestamp: Date): Promise<Checkpoint> {
        // Validate status
        if (!isValidStatus(status)) {
            throw new InvalidStatusException(status, VALID_STATUSES);
        }

        // Idempotency check: verify if unit already has this status
        const existingUnit = await this.unitRepository.findById(unitId);
        if (existingUnit && existingUnit.status === status) {
            throw new DuplicateRequestException(
                `Unit ${unitId} already has status '${status}'. Duplicate request detected.`
            );
        }

        const checkpoint = new Checkpoint(unitId, status, timestamp);
        await this.checkpointRepository.save(checkpoint);

        let unit = existingUnit;
        if (!unit) {
            unit = new Unit(unitId, status);
        } else {
            unit.updateStatus(status);
        }
        await this.unitRepository.save(unit);

        return checkpoint;
    }
}
