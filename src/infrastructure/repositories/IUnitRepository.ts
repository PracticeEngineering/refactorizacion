import { Unit } from "../../domain/entities/Unit.js";

export interface IUnitRepository {
    save(unit: Unit): Promise<void>;
    findById(id: string): Promise<Unit | null>;
    findAll(): Promise<Unit[]>;
}
