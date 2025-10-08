import { describe, it, expect } from '@jest/globals';
import { CheckpointStatus, isValidStatus, VALID_STATUSES } from '../../../domain/enums/CheckpointStatus.js';

describe('CheckpointStatus', () => {
  describe('CheckpointStatus enum', () => {
    it('should have all expected status values', () => {
      expect(CheckpointStatus.CREATED).toBe('CREATED');
      expect(CheckpointStatus.PICKED_UP).toBe('PICKED_UP');
      expect(CheckpointStatus.IN_TRANSIT).toBe('IN_TRANSIT');
      expect(CheckpointStatus.AT_FACILITY).toBe('AT_FACILITY');
      expect(CheckpointStatus.OUT_FOR_DELIVERY).toBe('OUT_FOR_DELIVERY');
      expect(CheckpointStatus.DELIVERED).toBe('DELIVERED');
      expect(CheckpointStatus.EXCEPTION).toBe('EXCEPTION');
    });
  });

  describe('VALID_STATUSES', () => {
    it('should contain all status values', () => {
      expect(VALID_STATUSES).toHaveLength(7);
      expect(VALID_STATUSES).toContain('CREATED');
      expect(VALID_STATUSES).toContain('PICKED_UP');
      expect(VALID_STATUSES).toContain('IN_TRANSIT');
      expect(VALID_STATUSES).toContain('AT_FACILITY');
      expect(VALID_STATUSES).toContain('OUT_FOR_DELIVERY');
      expect(VALID_STATUSES).toContain('DELIVERED');
      expect(VALID_STATUSES).toContain('EXCEPTION');
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid status values', () => {
      expect(isValidStatus('CREATED')).toBe(true);
      expect(isValidStatus('PICKED_UP')).toBe(true);
      expect(isValidStatus('IN_TRANSIT')).toBe(true);
      expect(isValidStatus('AT_FACILITY')).toBe(true);
      expect(isValidStatus('OUT_FOR_DELIVERY')).toBe(true);
      expect(isValidStatus('DELIVERED')).toBe(true);
      expect(isValidStatus('EXCEPTION')).toBe(true);
    });

    it('should return false for invalid status values', () => {
      expect(isValidStatus('INVALID')).toBe(false);
      expect(isValidStatus('invalid')).toBe(false);
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus('created')).toBe(false);
      expect(isValidStatus('UNKNOWN_STATUS')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidStatus(' CREATED ')).toBe(false);
      expect(isValidStatus('CREATED ')).toBe(false);
      expect(isValidStatus(' CREATED')).toBe(false);
    });
  });
});
