import { describe, it, expect } from '@jest/globals';
import { InvalidStatusException } from '../../../domain/exceptions/InvalidStatusException.js';

describe('InvalidStatusException', () => {
  it('should create exception with formatted message', () => {
    const status = 'INVALID_STATUS';
    const validStatuses = ['CREATED', 'DELIVERED', 'IN_TRANSIT'];
    const exception = new InvalidStatusException(status, validStatuses);
    
    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(InvalidStatusException);
    expect(exception.name).toBe('InvalidStatusException');
    expect(exception.message).toBe(
      "Invalid status 'INVALID_STATUS'. Valid statuses are: CREATED, DELIVERED, IN_TRANSIT"
    );
  });

  it('should handle single valid status', () => {
    const exception = new InvalidStatusException('WRONG', ['CREATED']);
    
    expect(exception.message).toBe("Invalid status 'WRONG'. Valid statuses are: CREATED");
  });

  it('should handle empty valid statuses array', () => {
    const exception = new InvalidStatusException('ANY', []);
    
    expect(exception.message).toBe("Invalid status 'ANY'. Valid statuses are: ");
  });

  it('should handle multiple valid statuses', () => {
    const validStatuses = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    const exception = new InvalidStatusException('UNKNOWN', validStatuses);
    
    expect(exception.message).toContain('CREATED, PICKED_UP, IN_TRANSIT, DELIVERED');
  });

  it('should have stack trace', () => {
    const exception = new InvalidStatusException('TEST', ['VALID']);
    
    expect(exception.stack).toBeDefined();
    expect(exception.stack).toContain('InvalidStatusException');
  });

  it('should be catchable as Error', () => {
    try {
      throw new InvalidStatusException('BAD_STATUS', ['GOOD_STATUS']);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InvalidStatusException);
      if (error instanceof InvalidStatusException) {
        expect(error.message).toContain('BAD_STATUS');
        expect(error.message).toContain('GOOD_STATUS');
      }
    }
  });
});
