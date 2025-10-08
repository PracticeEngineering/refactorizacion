import { v4 } from "uuid";

export interface CheckpointHistoryItem {
    status: string;
    date: string;
}

export class Checkpoint {
    public id: string;
    public unitId: string;
    public status: string;
    public timestamp: string;
    public history: CheckpointHistoryItem[];

    constructor(unitId: string, status: string, timestamp: Date) {
        this.id = v4();
        this.unitId = unitId;
        this.status = status;
        this.timestamp = timestamp.toISOString();
        this.history = [];
    }
}
