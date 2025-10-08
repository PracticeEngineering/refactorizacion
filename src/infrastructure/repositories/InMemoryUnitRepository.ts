import { Unit } from "../../domain/entities/Unit.js";
import { IUnitRepository } from "./IUnitRepository.js";

export class InMemoryUnitRepository implements IUnitRepository {
    private units: Map<string, Unit> = new Map();

    async save(unit: Unit): Promise<void> {
        this.units.set(unit.id, unit);
    }

    async findById(id: string): Promise<Unit | null> {
        const unit = this.units.get(id);
        return unit ? unit : null;
    }

    async findAll(): Promise<Unit[]> {
        return Array.from(this.units.values());
    }

    async findByStatus(status: string): Promise<Unit[]> {
        const allUnits = await this.findAll();
        return allUnits.filter(unit => unit.status === status);
    }
}
