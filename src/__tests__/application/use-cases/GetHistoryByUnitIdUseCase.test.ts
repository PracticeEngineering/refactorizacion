import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetHistoryByUnitIdUseCase } from '../../../application/use-cases/GetHistoryByUnitIdUseCase.js';
import { ICheckpointRepository } from '../../../domain/InterfacesRepositories/ICheckpointRepository.js';
import { Checkpoint } from '../../../domain/entities/Checkpoint.js';
import { CheckpointStatus } from '../../../domain/enums/CheckpointStatus.js';

// Mock repository
class MockCheckpointRepository implements ICheckpointRepository {
  private checkpoints: Checkpoint[] = [];

  async save(checkpoint: Checkpoint): Promise<void> {
    this.checkpoints.push(checkpoint);
  }

  async findById(id: string): Promise<Checkpoint | null> {
    return this.checkpoints.find(c => c.id === id) || null;
  }

  async findByUnitId(unitId: string): Promise<Checkpoint[]> {
    return this.checkpoints.filter(c => c.unitId === unitId);
  }

  clear(): void {
    this.checkpoints = [];
  }
}

describe('GetHistoryByUnitIdUseCase', () => {
  let useCase: GetHistoryByUnitIdUseCase;
  let repository: MockCheckpointRepository;

  beforeEach(() => {
    repository = new MockCheckpointRepository();
    useCase = new GetHistoryByUnitIdUseCase(repository);
  });

  describe('Successful History Retrieval', () => {
    it('should return empty array when no checkpoints exist for unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';

      const history = await useCase.execute(unitId);

      expect(history).toEqual([]);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('should return single checkpoint for unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const checkpoint = new Checkpoint(unitId, CheckpointStatus.CREATED, new Date());
      await repository.save(checkpoint);

      const history = await useCase.execute(unitId);

      expect(history.length).toBe(1);
      expect(history[0].unitId).toBe(unitId);
      expect(history[0].status).toBe(CheckpointStatus.CREATED);
    });

    it('should return multiple checkpoints for unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      
      const checkpoint1 = new Checkpoint(unitId, CheckpointStatus.CREATED, new Date('2025-10-08T10:00:00Z'));
      const checkpoint2 = new Checkpoint(unitId, CheckpointStatus.PICKED_UP, new Date('2025-10-08T11:00:00Z'));
      const checkpoint3 = new Checkpoint(unitId, CheckpointStatus.IN_TRANSIT, new Date('2025-10-08T12:00:00Z'));
      
      await repository.save(checkpoint1);
      await repository.save(checkpoint2);
      await repository.save(checkpoint3);

      const history = await useCase.execute(unitId);

      expect(history.length).toBe(3);
      expect(history[0].status).toBe(CheckpointStatus.CREATED);
      expect(history[1].status).toBe(CheckpointStatus.PICKED_UP);
      expect(history[2].status).toBe(CheckpointStatus.IN_TRANSIT);
    });

    it('should return only checkpoints for specified unit', async () => {
      const unitId1 = '123e4567-e89b-12d3-a456-426614174000';
      const unitId2 = '987e6543-e21b-12d3-a456-426614174999';
      
      await repository.save(new Checkpoint(unitId1, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId2, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId1, CheckpointStatus.PICKED_UP, new Date()));
      await repository.save(new Checkpoint(unitId2, CheckpointStatus.PICKED_UP, new Date()));

      const history = await useCase.execute(unitId1);

      expect(history.length).toBe(2);
      expect(history.every(c => c.unitId === unitId1)).toBe(true);
    });
  });

  describe('Complete Delivery Workflow', () => {
    it('should return complete history of delivery workflow', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      
      const statuses = [
        CheckpointStatus.CREATED,
        CheckpointStatus.PICKED_UP,
        CheckpointStatus.IN_TRANSIT,
        CheckpointStatus.AT_FACILITY,
        CheckpointStatus.OUT_FOR_DELIVERY,
        CheckpointStatus.DELIVERED
      ];

      for (const status of statuses) {
        await repository.save(new Checkpoint(unitId, status, new Date()));
      }

      const history = await useCase.execute(unitId);

      expect(history.length).toBe(6);
      expect(history[0].status).toBe(CheckpointStatus.CREATED);
      expect(history[5].status).toBe(CheckpointStatus.DELIVERED);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unit with exception status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      
      await repository.save(new Checkpoint(unitId, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId, CheckpointStatus.IN_TRANSIT, new Date()));
      await repository.save(new Checkpoint(unitId, CheckpointStatus.EXCEPTION, new Date()));

      const history = await useCase.execute(unitId);

      expect(history.length).toBe(3);
      expect(history[2].status).toBe(CheckpointStatus.EXCEPTION);
    });

    it('should handle empty string as unitId', async () => {
      const history = await useCase.execute('');

      expect(history).toEqual([]);
    });

    it('should handle non-existent UUID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const history = await useCase.execute(nonExistentId);

      expect(history).toEqual([]);
    });

    it('should return checkpoints with all properties intact', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const timestamp = new Date('2025-10-08T12:34:56.789Z');
      const checkpoint = new Checkpoint(unitId, CheckpointStatus.CREATED, timestamp);
      await repository.save(checkpoint);

      const history = await useCase.execute(unitId);

      expect(history[0].id).toBeDefined();
      expect(history[0].unitId).toBe(unitId);
      expect(history[0].status).toBe(CheckpointStatus.CREATED);
      expect(history[0].timestamp).toBe('2025-10-08T12:34:56.789Z');
      expect(history[0].history).toEqual([]);
    });
  });

  describe('Multiple Units', () => {
    it('should handle multiple units with different histories', async () => {
      const unitId1 = '123e4567-e89b-12d3-a456-426614174000';
      const unitId2 = '987e6543-e21b-12d3-a456-426614174999';
      const unitId3 = '456e7890-e12b-34d5-a678-901234567890';
      
      await repository.save(new Checkpoint(unitId1, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId1, CheckpointStatus.DELIVERED, new Date()));
      
      await repository.save(new Checkpoint(unitId2, CheckpointStatus.CREATED, new Date()));
      
      await repository.save(new Checkpoint(unitId3, CheckpointStatus.CREATED, new Date()));
      await repository.save(new Checkpoint(unitId3, CheckpointStatus.PICKED_UP, new Date()));
      await repository.save(new Checkpoint(unitId3, CheckpointStatus.IN_TRANSIT, new Date()));

      const history1 = await useCase.execute(unitId1);
      const history2 = await useCase.execute(unitId2);
      const history3 = await useCase.execute(unitId3);

      expect(history1.length).toBe(2);
      expect(history2.length).toBe(1);
      expect(history3.length).toBe(3);
    });
  });
});
