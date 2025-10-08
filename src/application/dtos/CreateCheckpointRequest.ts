import { CheckpointStatusType } from "../../domain/enums/CheckpointStatus.js";

export interface CreateCheckpointRequest {
    unitId: string;
    status: CheckpointStatusType;
    timestamp: Date;
}

export interface CreateCheckpointResponse {
    id: string;
    unitId: string;
    status: CheckpointStatusType;
    timestamp: string;
}
