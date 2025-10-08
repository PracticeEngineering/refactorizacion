import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemoryUnitRepository } from '../../../infrastructure/repositories/InMemoryUnitRepository.js';
import { Unit } from '../../../domain/entities/Unit.js';
import { CheckpointStatus } from '../../../domain/enums/CheckpointStatus.js';

describe('InMemoryUnitRepository', () => {
  let repository: InMemoryUnitRepository;

  beforeEach(() => {
    repository = new InMemoryUnitRepository();
  });

  describe('save', () => {
    it('should save a unit', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);

      await repository.save(unit);

      const found = await repository.findById('unit-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('unit-1');
    });

    it('should save multiple units', async () => {
      const unit1 = new Unit('unit-1', CheckpointStatus.CREATED);
      const unit2 = new Unit('unit-2', CheckpointStatus.PICKED_UP);
      const unit3 = new Unit('unit-3', CheckpointStatus.DELIVERED);

      await repository.save(unit1);
      await repository.save(unit2);
      await repository.save(unit3);

      const found1 = await repository.findById('unit-1');
      const found2 = await repository.findById('unit-2');
      const found3 = await repository.findById('unit-3');

      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
      expect(found3).not.toBeNull();
    });

    it('should overwrite unit with same id', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);
      
      await repository.save(unit);
      
      unit.updateStatus(CheckpointStatus.DELIVERED);
      await repository.save(unit);

      const found = await repository.findById('unit-1');
      expect(found?.status).toBe(CheckpointStatus.DELIVERED);
    });
  });

  describe('findById', () => {
    it('should return null when unit does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return unit when it exists', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);
      await repository.save(unit);

      const found = await repository.findById('unit-1');

      expect(found).not.toBeNull();
      expect(found?.id).toBe('unit-1');
      expect(found?.status).toBe(CheckpointStatus.CREATED);
    });

    it('should return correct unit among multiple', async () => {
      const unit1 = new Unit('unit-1', CheckpointStatus.CREATED);
      const unit2 = new Unit('unit-2', CheckpointStatus.PICKED_UP);
      const unit3 = new Unit('unit-3', CheckpointStatus.DELIVERED);

      await repository.save(unit1);
      await repository.save(unit2);
      await repository.save(unit3);

      const found = await repository.findById('unit-2');

      expect(found?.id).toBe('unit-2');
      expect(found?.status).toBe(CheckpointStatus.PICKED_UP);
    });

    it('should preserve unit checkpoint history', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);
      unit.updateStatus(CheckpointStatus.PICKED_UP);
      unit.updateStatus(CheckpointStatus.IN_TRANSIT);
      
      await repository.save(unit);

      const found = await repository.findById('unit-1');

      expect(found?.checkpoints.length).toBe(2);
      expect(found?.checkpoints[0].status).toBe(CheckpointStatus.PICKED_UP);
      expect(found?.checkpoints[1].status).toBe(CheckpointStatus.IN_TRANSIT);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no units exist', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return all units', async () => {
      const unit1 = new Unit('unit-1', CheckpointStatus.CREATED);
      const unit2 = new Unit('unit-2', CheckpointStatus.PICKED_UP);
      const unit3 = new Unit('unit-3', CheckpointStatus.DELIVERED);

      await repository.save(unit1);
      await repository.save(unit2);
      await repository.save(unit3);

      const result = await repository.findAll();

      expect(result.length).toBe(3);
      expect(result.map(u => u.id)).toContain('unit-1');
      expect(result.map(u => u.id)).toContain('unit-2');
      expect(result.map(u => u.id)).toContain('unit-3');
    });

    it('should return units with all properties', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);
      unit.updateStatus(CheckpointStatus.PICKED_UP);
      
      await repository.save(unit);

      const result = await repository.findAll();

      expect(result[0].id).toBe('unit-1');
      expect(result[0].status).toBe(CheckpointStatus.PICKED_UP);
      expect(result[0].checkpoints.length).toBe(1);
    });
  });

  describe('findByStatus', () => {
    it('should return empty array when no units have the status', async () => {
      const unit1 = new Unit('unit-1', CheckpointStatus.CREATED);
      const unit2 = new Unit('unit-2', CheckpointStatus.PICKED_UP);
      
      await repository.save(unit1);
      await repository.save(unit2);

      const result = await repository.findByStatus(CheckpointStatus.DELIVERED);

      expect(result).toEqual([]);
    });

    it('should return units with specified status', async () => {
      const unit1 = new Unit('unit-1', CheckpointStatus.CREATED);
      const unit2 = new Unit('unit-2', CheckpointStatus.IN_TRANSIT);
      const unit3 = new Unit('unit-3', CheckpointStatus.IN_TRANSIT);
      const unit4 = new Unit('unit-4', CheckpointStatus.DELIVERED);

      await repository.save(unit1);
      await repository.save(unit2);
      await repository.save(unit3);
      await repository.save(unit4);

      const result = await repository.findByStatus(CheckpointStatus.IN_TRANSIT);

      expect(result.length).toBe(2);
      expect(result.every(u => u.status === CheckpointStatus.IN_TRANSIT)).toBe(true);
      expect(result.map(u => u.id)).toContain('unit-2');
      expect(result.map(u => u.id)).toContain('unit-3');
    });

    it('should return single unit with status', async () => {
      const unit1 = new Unit('unit-1', CheckpointStatus.CREATED);
      const unit2 = new Unit('unit-2', CheckpointStatus.DELIVERED);

      await repository.save(unit1);
      await repository.save(unit2);

      const result = await repository.findByStatus(CheckpointStatus.DELIVERED);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('unit-2');
      expect(result[0].status).toBe(CheckpointStatus.DELIVERED);
    });

    it('should handle all status types', async () => {
      const statuses = [
        CheckpointStatus.CREATED,
        CheckpointStatus.PICKED_UP,
        CheckpointStatus.IN_TRANSIT,
        CheckpointStatus.AT_FACILITY,
        CheckpointStatus.OUT_FOR_DELIVERY,
        CheckpointStatus.DELIVERED,
        CheckpointStatus.EXCEPTION
      ];

      for (let i = 0; i < statuses.length; i++) {
        await repository.save(new Unit(`unit-${i}`, statuses[i]));
      }

      for (const status of statuses) {
        const result = await repository.findByStatus(status);
        expect(result.length).toBe(1);
        expect(result[0].status).toBe(status);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as id in findById', async () => {
      const result = await repository.findById('');

      expect(result).toBeNull();
    });

    it('should handle empty string as status in findByStatus', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);
      await repository.save(unit);

      const result = await repository.findByStatus('');

      expect(result).toEqual([]);
    });

    it('should handle unit with empty id', async () => {
      const unit = new Unit('', CheckpointStatus.CREATED);
      await repository.save(unit);

      const found = await repository.findById('');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('');
    });

    it('should handle large number of units', async () => {
      for (let i = 0; i < 100; i++) {
        await repository.save(new Unit(`unit-${i}`, CheckpointStatus.IN_TRANSIT));
      }

      const allUnits = await repository.findAll();
      const transitUnits = await repository.findByStatus(CheckpointStatus.IN_TRANSIT);

      expect(allUnits.length).toBe(100);
      expect(transitUnits.length).toBe(100);
    });

    it('should update unit status correctly', async () => {
      const unit = new Unit('unit-1', CheckpointStatus.CREATED);
      await repository.save(unit);

      unit.updateStatus(CheckpointStatus.PICKED_UP);
      await repository.save(unit);

      unit.updateStatus(CheckpointStatus.IN_TRANSIT);
      await repository.save(unit);

      const found = await repository.findById('unit-1');
      expect(found?.status).toBe(CheckpointStatus.IN_TRANSIT);
      expect(found?.checkpoints.length).toBe(2);
    });
  });
});
