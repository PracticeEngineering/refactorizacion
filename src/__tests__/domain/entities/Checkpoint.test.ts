import { describe, it, expect, beforeEach } from '@jest/globals';
import { Checkpoint } from '../../../domain/entities/Checkpoint.js';
import { CheckpointStatus } from '../../../domain/enums/CheckpointStatus.js';

describe('Checkpoint Entity', () => {
  describe('Constructor', () => {
    it('should create a checkpoint with valid data', () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;
      const timestamp = new Date('2025-10-08T10:00:00.000Z');

      const checkpoint = new Checkpoint(unitId, status, timestamp);

      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.unitId).toBe(unitId);
      expect(checkpoint.status).toBe(status);
      expect(checkpoint.timestamp).toBe('2025-10-08T10:00:00.000Z');
      expect(checkpoint.history).toEqual([]);
    });

    it('should generate a unique UUID for id', () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;
      const timestamp = new Date();

      const checkpoint1 = new Checkpoint(unitId, status, timestamp);
      const checkpoint2 = new Checkpoint(unitId, status, timestamp);

      expect(checkpoint1.id).toBeDefined();
      expect(checkpoint2.id).toBeDefined();
      expect(checkpoint1.id).not.toBe(checkpoint2.id);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(checkpoint1.id).toMatch(uuidRegex);
      expect(checkpoint2.id).toMatch(uuidRegex);
    });

    it('should convert timestamp to ISO string format', () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.DELIVERED;
      const timestamp = new Date('2025-10-08T15:30:45.123Z');

      const checkpoint = new Checkpoint(unitId, status, timestamp);

      expect(checkpoint.timestamp).toBe('2025-10-08T15:30:45.123Z');
      expect(typeof checkpoint.timestamp).toBe('string');
    });

    it('should initialize history as empty array', () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.IN_TRANSIT;
      const timestamp = new Date();

      const checkpoint = new Checkpoint(unitId, status, timestamp);

      expect(checkpoint.history).toEqual([]);
      expect(Array.isArray(checkpoint.history)).toBe(true);
      expect(checkpoint.history.length).toBe(0);
    });
  });

  describe('Different Status Values', () => {
    it('should create checkpoint with CREATED status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.CREATED,
        new Date()
      );
      expect(checkpoint.status).toBe('CREATED');
    });

    it('should create checkpoint with PICKED_UP status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.PICKED_UP,
        new Date()
      );
      expect(checkpoint.status).toBe('PICKED_UP');
    });

    it('should create checkpoint with IN_TRANSIT status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.IN_TRANSIT,
        new Date()
      );
      expect(checkpoint.status).toBe('IN_TRANSIT');
    });

    it('should create checkpoint with AT_FACILITY status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.AT_FACILITY,
        new Date()
      );
      expect(checkpoint.status).toBe('AT_FACILITY');
    });

    it('should create checkpoint with OUT_FOR_DELIVERY status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.OUT_FOR_DELIVERY,
        new Date()
      );
      expect(checkpoint.status).toBe('OUT_FOR_DELIVERY');
    });

    it('should create checkpoint with DELIVERED status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.DELIVERED,
        new Date()
      );
      expect(checkpoint.status).toBe('DELIVERED');
    });

    it('should create checkpoint with EXCEPTION status', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.EXCEPTION,
        new Date()
      );
      expect(checkpoint.status).toBe('EXCEPTION');
    });
  });

  describe('Edge Cases', () => {
    it('should handle timestamp at epoch', () => {
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.CREATED,
        new Date(0)
      );
      expect(checkpoint.timestamp).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle timestamp with milliseconds', () => {
      const timestamp = new Date('2025-10-08T12:34:56.789Z');
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.CREATED,
        timestamp
      );
      expect(checkpoint.timestamp).toBe('2025-10-08T12:34:56.789Z');
    });

    it('should handle current timestamp', () => {
      const now = new Date();
      const checkpoint = new Checkpoint(
        '123e4567-e89b-12d3-a456-426614174000',
        CheckpointStatus.CREATED,
        now
      );
      expect(checkpoint.timestamp).toBe(now.toISOString());
    });
  });
});
