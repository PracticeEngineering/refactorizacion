import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Unit } from '../../../domain/entities/Unit.js';
import { CheckpointStatus } from '../../../domain/enums/CheckpointStatus.js';

describe('Unit Entity', () => {
  describe('Constructor', () => {
    it('should create a unit with valid data', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const status = CheckpointStatus.CREATED;

      const unit = new Unit(id, status);

      expect(unit.id).toBe(id);
      expect(unit.status).toBe(status);
      expect(unit.checkpoints).toEqual([]);
    });

    it('should initialize checkpoints as empty array', () => {
      const unit = new Unit('test-id', CheckpointStatus.CREATED);

      expect(unit.checkpoints).toEqual([]);
      expect(Array.isArray(unit.checkpoints)).toBe(true);
      expect(unit.checkpoints.length).toBe(0);
    });

    it('should accept different status values', () => {
      const unit1 = new Unit('id1', CheckpointStatus.CREATED);
      const unit2 = new Unit('id2', CheckpointStatus.DELIVERED);
      const unit3 = new Unit('id3', CheckpointStatus.IN_TRANSIT);

      expect(unit1.status).toBe('CREATED');
      expect(unit2.status).toBe('DELIVERED');
      expect(unit3.status).toBe('IN_TRANSIT');
    });
  });

  describe('updateStatus', () => {
    let unit: Unit;
    let originalDateNow: () => number;

    beforeEach(() => {
      unit = new Unit('test-unit-id', CheckpointStatus.CREATED);
      originalDateNow = Date.now;
    });

    it('should update the status', () => {
      expect(unit.status).toBe(CheckpointStatus.CREATED);

      unit.updateStatus(CheckpointStatus.PICKED_UP);

      expect(unit.status).toBe(CheckpointStatus.PICKED_UP);
    });

    it('should add checkpoint to history when updating status', () => {
      expect(unit.checkpoints.length).toBe(0);

      unit.updateStatus(CheckpointStatus.PICKED_UP);

      expect(unit.checkpoints.length).toBe(1);
      expect(unit.checkpoints[0].status).toBe(CheckpointStatus.PICKED_UP);
      expect(unit.checkpoints[0].date).toBeDefined();
    });

    it('should add multiple checkpoints to history', () => {
      unit.updateStatus(CheckpointStatus.PICKED_UP);
      unit.updateStatus(CheckpointStatus.IN_TRANSIT);
      unit.updateStatus(CheckpointStatus.DELIVERED);

      expect(unit.checkpoints.length).toBe(3);
      expect(unit.checkpoints[0].status).toBe(CheckpointStatus.PICKED_UP);
      expect(unit.checkpoints[1].status).toBe(CheckpointStatus.IN_TRANSIT);
      expect(unit.checkpoints[2].status).toBe(CheckpointStatus.DELIVERED);
      expect(unit.status).toBe(CheckpointStatus.DELIVERED);
    });

    it('should store date as string in checkpoint history', () => {
      unit.updateStatus(CheckpointStatus.PICKED_UP);

      expect(typeof unit.checkpoints[0].date).toBe('string');
      expect(unit.checkpoints[0].date.length).toBeGreaterThan(0);
    });

    it('should maintain chronological order in history', () => {
      const mockDate1 = new Date('2025-10-08T10:00:00.000Z');
      const mockDate2 = new Date('2025-10-08T11:00:00.000Z');
      const mockDate3 = new Date('2025-10-08T12:00:00.000Z');

      // Mock Date constructor for first update
      global.Date = jest.fn(() => mockDate1) as any;
      global.Date.now = jest.fn(() => mockDate1.getTime());
      unit.updateStatus(CheckpointStatus.PICKED_UP);

      // Mock Date constructor for second update
      global.Date = jest.fn(() => mockDate2) as any;
      global.Date.now = jest.fn(() => mockDate2.getTime());
      unit.updateStatus(CheckpointStatus.IN_TRANSIT);

      // Mock Date constructor for third update
      global.Date = jest.fn(() => mockDate3) as any;
      global.Date.now = jest.fn(() => mockDate3.getTime());
      unit.updateStatus(CheckpointStatus.DELIVERED);

      expect(unit.checkpoints.length).toBe(3);
      expect(unit.checkpoints[0].date).toBe(mockDate1.toString());
      expect(unit.checkpoints[1].date).toBe(mockDate2.toString());
      expect(unit.checkpoints[2].date).toBe(mockDate3.toString());

      // Restore original Date
      global.Date = Date as any;
    });

    it('should allow updating to the same status', () => {
      unit.updateStatus(CheckpointStatus.CREATED);
      unit.updateStatus(CheckpointStatus.CREATED);

      expect(unit.status).toBe(CheckpointStatus.CREATED);
      expect(unit.checkpoints.length).toBe(2);
    });
  });

  describe('Status Transitions', () => {
    it('should handle complete delivery workflow', () => {
      const unit = new Unit('package-123', CheckpointStatus.CREATED);

      unit.updateStatus(CheckpointStatus.PICKED_UP);
      expect(unit.status).toBe(CheckpointStatus.PICKED_UP);

      unit.updateStatus(CheckpointStatus.IN_TRANSIT);
      expect(unit.status).toBe(CheckpointStatus.IN_TRANSIT);

      unit.updateStatus(CheckpointStatus.AT_FACILITY);
      expect(unit.status).toBe(CheckpointStatus.AT_FACILITY);

      unit.updateStatus(CheckpointStatus.OUT_FOR_DELIVERY);
      expect(unit.status).toBe(CheckpointStatus.OUT_FOR_DELIVERY);

      unit.updateStatus(CheckpointStatus.DELIVERED);
      expect(unit.status).toBe(CheckpointStatus.DELIVERED);

      expect(unit.checkpoints.length).toBe(5);
    });

    it('should handle exception status', () => {
      const unit = new Unit('package-456', CheckpointStatus.IN_TRANSIT);

      unit.updateStatus(CheckpointStatus.EXCEPTION);

      expect(unit.status).toBe(CheckpointStatus.EXCEPTION);
      expect(unit.checkpoints.length).toBe(1);
      expect(unit.checkpoints[0].status).toBe(CheckpointStatus.EXCEPTION);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as id', () => {
      const unit = new Unit('', CheckpointStatus.CREATED);
      expect(unit.id).toBe('');
    });

    it('should preserve checkpoint history immutability', () => {
      const unit = new Unit('test-id', CheckpointStatus.CREATED);
      
      unit.updateStatus(CheckpointStatus.PICKED_UP);
      const firstCheckpoint = unit.checkpoints[0];
      
      unit.updateStatus(CheckpointStatus.IN_TRANSIT);
      
      // First checkpoint should remain unchanged
      expect(unit.checkpoints[0]).toBe(firstCheckpoint);
      expect(unit.checkpoints[0].status).toBe(CheckpointStatus.PICKED_UP);
    });
  });
});
