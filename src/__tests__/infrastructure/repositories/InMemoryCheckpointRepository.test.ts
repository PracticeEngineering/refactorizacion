import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemoryCheckpointRepository } from '../../../infrastructure/repositories/InMemoryCheckpointRepository.js';
import { Checkpoint } from '../../../domain/entities/Checkpoint.js';
import { CheckpointStatus } from '../../../domain/enums/CheckpointStatus.js';

describe('InMemoryCheckpointRepository', () => {
  let repository: InMemoryCheckpointRepository;

  beforeEach(() => {
    repository = new InMemoryCheckpointRepository();
  });

  describe('save', () => {
    it('should save a checkpoint', async () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.CREATED,
        new Date()
      );

      await repository.save(checkpoint);

      const found = await repository.findById(checkpoint.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(checkpoint.id);
    });

    it('should save multiple checkpoints', async () => {
      const checkpoint1 = new Checkpoint('unit-1', CheckpointStatus.CREATED, new Date());
      const checkpoint2 = new Checkpoint('unit-2', CheckpointStatus.PICKED_UP, new Date());
      const checkpoint3 = new Checkpoint('unit-3', CheckpointStatus.DELIVERED, new Date());

      await repository.save(checkpoint1);
      await repository.save(checkpoint2);
      await repository.save(checkpoint3);

      const found1 = await repository.findById(checkpoint1.id);
      const found2 = await repository.findById(checkpoint2.id);
      const found3 = await repository.findById(checkpoint3.id);

      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
      expect(found3).not.toBeNull();
    });

    it('should overwrite checkpoint with same id', async () => {
      const checkpoint = new Checkpoint('unit-1', CheckpointStatus.CREATED, new Date());
      
      await repository.save(checkpoint);
      
      // Modify and save again
      checkpoint.status = CheckpointStatus.DELIVERED;
      await repository.save(checkpoint);

      const found = await repository.findById(checkpoint.id);
      expect(found?.status).toBe(CheckpointStatus.DELIVERED);
    });
  });

  describe('findById', () => {
    it('should return null when checkpoint does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return checkpoint when it exists', async () => {
      const checkpoint = new Checkpoint('unit-1', CheckpointStatus.CREATED, new Date());
      await repository.save(checkpoint);

      const found = await repository.findById(checkpoint.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(checkpoint.id);
      expect(found?.unitId).toBe('unit-1');
      expect(found?.status).toBe(CheckpointStatus.CREATED);
    });

    it('should return correct checkpoint among multiple', async () => {
      const checkpoint1 = new Checkpoint('unit-1', CheckpointStatus.CREATED, new Date());
      const checkpoint2 = new Checkpoint('unit-2', CheckpointStatus.PICKED_UP, new Date());
      const checkpoint3 = new Checkpoint('unit-3', CheckpointStatus.DELIVERED, new Date());

      await repository.save(checkpoint1);
      await repository.save(checkpoint2);
      await repository.save(checkpoint3);

      const found = await repository.findById(checkpoint2.id);

      expect(found?.id).toBe(checkpoint2.id);
      expect(found?.unitId).toBe('unit-2');
      expect(found?.status).toBe(CheckpointStatus.PICKED_UP);
    });
  });

  describe('findByUnitId', () => {
    it('should return empty array when no checkpoints exist for unit', async () => {
      const result = await repository.findByUnitId('non-existent-unit');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return single checkpoint for unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const checkpoint = new Checkpoint(unitId, CheckpointStatus.CREATED, new Date());
      await repository.save(checkpoint);

      const result = await repository.findByUnitId(unitId);

      expect(result.length).toBe(1);
      expect(result[0].unitId).toBe(unitId);
    });

    it('should return multiple checkpoints for same unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      
      const checkpoint1 = new Checkpoint(unitId, CheckpointStatus.CREATED, new Date());
      const checkpoint2 = new Checkpoint(unitId, CheckpointStatus.PICKED_UP, new Date());
      const checkpoint3 = new Checkpoint(unitId, CheckpointStatus.IN_TRANSIT, new Date());

      await repository.save(checkpoint1);
      await repository.save(checkpoint2);
      await repository.save(checkpoint3);

      const result = await repository.findByUnitId(unitId);

      expect(result.length).toBe(3);
      expect(result.every(c => c.unitId === unitId)).toBe(true);
    });

    it('should return only checkpoints for specified unit', async () => {
      const unitId1 = '123e4567-e89b-12d3-a456-426614174000';
      const unitId2 = '987e6543-e21b-12d3-a456-426614174999';

      await repository.save(new Checkpoint(unitId1, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId2, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId1, CheckpointStatus.PICKED_UP, new Date()));
      await repository.save(new Checkpoint(unitId2, CheckpointStatus.PICKED_UP, new Date()));

      const result = await repository.findByUnitId(unitId1);

      expect(result.length).toBe(2);
      expect(result.every(c => c.unitId === unitId1)).toBe(true);
    });

    it('should maintain insertion order', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      
      const checkpoint1 = new Checkpoint(unitId, CheckpointStatus.CREATED, new Date());
      const checkpoint2 = new Checkpoint(unitId, CheckpointStatus.PICKED_UP, new Date());
      const checkpoint3 = new Checkpoint(unitId, CheckpointStatus.IN_TRANSIT, new Date());

      await repository.save(checkpoint1);
      await repository.save(checkpoint2);
      await repository.save(checkpoint3);

      const result = await repository.findByUnitId(unitId);

      expect(result[0].id).toBe(checkpoint1.id);
      expect(result[1].id).toBe(checkpoint2.id);
      expect(result[2].id).toBe(checkpoint3.id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as unitId in findByUnitId', async () => {
      const result = await repository.findByUnitId('');

      expect(result).toEqual([]);
    });

    it('should handle empty string as id in findById', async () => {
      const result = await repository.findById('');

      expect(result).toBeNull();
    });

    it('should preserve checkpoint properties', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const timestamp = new Date('2025-10-08T12:34:56.789Z');
      const checkpoint = new Checkpoint(unitId, CheckpointStatus.CREATED, timestamp);

      await repository.save(checkpoint);
      const found = await repository.findById(checkpoint.id);

      expect(found?.id).toBe(checkpoint.id);
      expect(found?.unitId).toBe(unitId);
      expect(found?.status).toBe(CheckpointStatus.CREATED);
      expect(found?.timestamp).toBe('2025-10-08T12:34:56.789Z');
      expect(found?.history).toEqual([]);
    });

    it('should handle large number of checkpoints', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const checkpoints: Checkpoint[] = [];

      for (let i = 0; i < 100; i++) {
        const checkpoint = new Checkpoint(unitId, CheckpointStatus.IN_TRANSIT, new Date());
        checkpoints.push(checkpoint);
        await repository.save(checkpoint);
      }

      const result = await repository.findByUnitId(unitId);

      expect(result.length).toBe(100);
    });
  });
});
