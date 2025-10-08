
import { Checkpoint } from "../../domain/entities/Checkpoint.js";
import { ICheckpointRepository } from "../../domain/InterfacesRepositories/ICheckpointRepository.js";

export class GetHistoryByUnitIdUseCase {
    constructor(private checkpointRepository: ICheckpointRepository) {}

    async execute(unitId: string): Promise<Checkpoint[]> {
        return this.checkpointRepository.findByUnitId(unitId);
    }
}
