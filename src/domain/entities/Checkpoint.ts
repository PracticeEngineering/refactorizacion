import { v4 } from "uuid";
import { CheckpointStatusType } from "../enums/CheckpointStatus.js";

export interface CheckpointHistoryItem {
    status: CheckpointStatusType;
    date: string;
}

export class Checkpoint {
    public id: string;
    public unitId: string;
    public status: CheckpointStatusType;
    public timestamp: string;
    public history: CheckpointHistoryItem[];

    constructor(unitId: string, status: CheckpointStatusType, timestamp: Date) {
        this.id = v4();
        this.unitId = unitId;
        this.status = status;
        this.timestamp = timestamp.toISOString();
        this.history = [];
    }
}
