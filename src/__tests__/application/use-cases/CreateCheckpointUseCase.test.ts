import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateCheckpointUseCase } from '../../../application/use-cases/CreateCheckpointUseCase.js';
import { ICheckpointRepository } from '../../../domain/InterfacesRepositories/ICheckpointRepository.js';
import { IUnitRepository } from '../../../domain/InterfacesRepositories/IUnitRepository.js';
import { Checkpoint } from '../../../domain/entities/Checkpoint.js';
import { Unit } from '../../../domain/entities/Unit.js';
import { CheckpointStatus } from '../../../domain/enums/CheckpointStatus.js';
import { DuplicateRequestException } from '../../../domain/exceptions/DuplicateRequestException.js';
import { InvalidStatusException } from '../../../domain/exceptions/InvalidStatusException.js';

// Mock repositories
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

  getAll(): Checkpoint[] {
    return this.checkpoints;
  }

  clear(): void {
    this.checkpoints = [];
  }
}

class MockUnitRepository implements IUnitRepository {
  private units: Map<string, Unit> = new Map();

  async save(unit: Unit): Promise<void> {
    this.units.set(unit.id, unit);
  }

  async findById(id: string): Promise<Unit | null> {
    return this.units.get(id) || null;
  }

  async findAll(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }

  async findByStatus(status: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(u => u.status === status);
  }

  clear(): void {
    this.units.clear();
  }
}

describe('CreateCheckpointUseCase', () => {
  let useCase: CreateCheckpointUseCase;
  let checkpointRepository: MockCheckpointRepository;
  let unitRepository: MockUnitRepository;

  beforeEach(() => {
    checkpointRepository = new MockCheckpointRepository();
    unitRepository = new MockUnitRepository();
    useCase = new CreateCheckpointUseCase(checkpointRepository, unitRepository);
  });

  describe('Successful Checkpoint Creation', () => {
    it('should create a checkpoint for a new unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;
      const timestamp = new Date('2025-10-08T10:00:00.000Z');

      const checkpoint = await useCase.execute(unitId, status, timestamp);

      expect(checkpoint).toBeDefined();
      expect(checkpoint.unitId).toBe(unitId);
      expect(checkpoint.status).toBe(status);
      expect(checkpoint.timestamp).toBe(timestamp.toISOString());
      expect(checkpoint.id).toBeDefined();
    });

    it('should save checkpoint to repository', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;
      const timestamp = new Date();

      await useCase.execute(unitId, status, timestamp);

      const savedCheckpoints = checkpointRepository.getAll();
      expect(savedCheckpoints.length).toBe(1);
      expect(savedCheckpoints[0].unitId).toBe(unitId);
      expect(savedCheckpoints[0].status).toBe(status);
    });

    it('should create a new unit if it does not exist', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;
      const timestamp = new Date();

      await useCase.execute(unitId, status, timestamp);

      const unit = await unitRepository.findById(unitId);
      expect(unit).not.toBeNull();
      expect(unit?.id).toBe(unitId);
      expect(unit?.status).toBe(status);
    });

    it('should update existing unit status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      
      // Create initial checkpoint
      await useCase.execute(unitId, CheckpointStatus.CREATED, new Date());
      
      // Update to new status
      await useCase.execute(unitId, CheckpointStatus.PICKED_UP, new Date());

      const unit = await unitRepository.findById(unitId);
      expect(unit?.status).toBe(CheckpointStatus.PICKED_UP);
    });

    it('should handle all valid status transitions', async () => {
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
        await useCase.execute(unitId, status, new Date());
      }

      const unit = await unitRepository.findById(unitId);
      expect(unit?.status).toBe(CheckpointStatus.DELIVERED);
      
      const checkpoints = checkpointRepository.getAll();
      expect(checkpoints.length).toBe(statuses.length);
    });
  });

  describe('Status Validation', () => {
    it('should throw InvalidStatusException for invalid status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const invalidStatus = 'INVALID_STATUS';
      const timestamp = new Date();

      await expect(
        useCase.execute(unitId, invalidStatus, timestamp)
      ).rejects.toThrow(InvalidStatusException);
    });

    it('should throw InvalidStatusException with correct message', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const invalidStatus = 'WRONG';
      const timestamp = new Date();

      try {
        await useCase.execute(unitId, invalidStatus, timestamp);
        fail('Should have thrown InvalidStatusException');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidStatusException);
        if (error instanceof InvalidStatusException) {
          expect(error.message).toContain('WRONG');
          expect(error.message).toContain('Valid statuses are');
        }
      }
    });

    it('should reject empty string as status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const timestamp = new Date();

      await expect(
        useCase.execute(unitId, '', timestamp)
      ).rejects.toThrow(InvalidStatusException);
    });

    it('should reject lowercase status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const timestamp = new Date();

      await expect(
        useCase.execute(unitId, 'created', timestamp)
      ).rejects.toThrow(InvalidStatusException);
    });
  });

  describe('Idempotency Check', () => {
    it('should throw DuplicateRequestException when unit already has the same status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;
      const timestamp = new Date();

      // First request - should succeed
      await useCase.execute(unitId, status, timestamp);

      // Second request with same status - should fail
      await expect(
        useCase.execute(unitId, status, new Date())
      ).rejects.toThrow(DuplicateRequestException);
    });

    it('should throw DuplicateRequestException with correct message', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.DELIVERED;

      await useCase.execute(unitId, status, new Date());

      try {
        await useCase.execute(unitId, status, new Date());
        fail('Should have thrown DuplicateRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(DuplicateRequestException);
        if (error instanceof DuplicateRequestException) {
          expect(error.message).toContain(unitId);
          expect(error.message).toContain(status);
          expect(error.message).toContain('already has status');
        }
      }
    });

    it('should allow different status updates for the same unit', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';

      await useCase.execute(unitId, CheckpointStatus.CREATED, new Date());
      await useCase.execute(unitId, CheckpointStatus.PICKED_UP, new Date());
      await useCase.execute(unitId, CheckpointStatus.IN_TRANSIT, new Date());

      const checkpoints = checkpointRepository.getAll();
      expect(checkpoints.length).toBe(3);
    });

    it('should not save checkpoint when duplicate is detected', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;

      await useCase.execute(unitId, status, new Date());

      try {
        await useCase.execute(unitId, status, new Date());
      } catch (error) {
        // Expected error
      }

      const checkpoints = checkpointRepository.getAll();
      expect(checkpoints.length).toBe(1); // Only first checkpoint saved
    });
  });

  describe('Unit History Tracking', () => {
    it('should update unit checkpoint history on status updates', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';

      // First checkpoint creates the unit (no history entry)
      await useCase.execute(unitId, CheckpointStatus.CREATED, new Date());
      
      // Second checkpoint updates the unit (adds to history)
      await useCase.execute(unitId, CheckpointStatus.PICKED_UP, new Date());

      const unit = await unitRepository.findById(unitId);
      // Only status updates (not initial creation) are added to history
      expect(unit?.checkpoints.length).toBe(1);
      expect(unit?.checkpoints[0].status).toBe(CheckpointStatus.PICKED_UP);
    });

    it('should accumulate multiple status updates in history', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';

      await useCase.execute(unitId, CheckpointStatus.CREATED, new Date());
      await useCase.execute(unitId, CheckpointStatus.PICKED_UP, new Date());
      await useCase.execute(unitId, CheckpointStatus.IN_TRANSIT, new Date());
      await useCase.execute(unitId, CheckpointStatus.DELIVERED, new Date());

      const unit = await unitRepository.findById(unitId);
      // First is creation (no history), next 3 are updates (in history)
      expect(unit?.checkpoints.length).toBe(3);
      expect(unit?.checkpoints[0].status).toBe(CheckpointStatus.PICKED_UP);
      expect(unit?.checkpoints[1].status).toBe(CheckpointStatus.IN_TRANSIT);
      expect(unit?.checkpoints[2].status).toBe(CheckpointStatus.DELIVERED);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple units independently', async () => {
      const unitId1 = '123e4567-e89b-12d3-a456-426614174000';
      const unitId2 = '987e6543-e21b-12d3-a456-426614174999';

      await useCase.execute(unitId1, CheckpointStatus.CREATED, new Date());
      await useCase.execute(unitId2, CheckpointStatus.CREATED, new Date());

      const unit1 = await unitRepository.findById(unitId1);
      const unit2 = await unitRepository.findById(unitId2);

      expect(unit1).not.toBeNull();
      expect(unit2).not.toBeNull();
      expect(unit1?.id).toBe(unitId1);
      expect(unit2?.id).toBe(unitId2);
    });

    it('should handle EXCEPTION status', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';

      await useCase.execute(unitId, CheckpointStatus.IN_TRANSIT, new Date());
      const checkpoint = await useCase.execute(unitId, CheckpointStatus.EXCEPTION, new Date());

      expect(checkpoint.status).toBe(CheckpointStatus.EXCEPTION);
      
      const unit = await unitRepository.findById(unitId);
      expect(unit?.status).toBe(CheckpointStatus.EXCEPTION);
    });

    it('should preserve timestamp precision', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const timestamp = new Date('2025-10-08T12:34:56.789Z');

      const checkpoint = await useCase.execute(unitId, CheckpointStatus.CREATED, timestamp);

      expect(checkpoint.timestamp).toBe('2025-10-08T12:34:56.789Z');
    });
  });
});
