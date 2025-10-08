import { CheckpointHistoryItem } from "./Checkpoint.js";
import { CheckpointStatusType } from "../enums/CheckpointStatus.js";

export class Unit {
    public id: string;
    public status: CheckpointStatusType;
    public checkpoints: CheckpointHistoryItem[];

    constructor(id: string, status: CheckpointStatusType) {
        this.id = id;
        this.status = status;
        this.checkpoints = [];
    }

    public updateStatus(newStatus: CheckpointStatusType) {
        this.status = newStatus;
        this.checkpoints.push({
            status: newStatus,
            date: new Date().toString()
        });
    }
}
