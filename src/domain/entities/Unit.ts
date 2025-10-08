import { CheckpointHistoryItem } from "./Checkpoint.js";

export class Unit {
    public id: string;
    public status: string;
    public checkpoints: CheckpointHistoryItem[];

    constructor(id: string, status: string) {
        this.id = id;
        this.status = status;
        this.checkpoints = [];
    }

    public updateStatus(newStatus: string) {
        this.status = newStatus;
        this.checkpoints.push({
            status: newStatus,
            date: new Date().toString()
        });
    }
}
