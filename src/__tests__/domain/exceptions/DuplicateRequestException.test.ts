import { describe, it, expect } from '@jest/globals';
import { DuplicateRequestException } from '../../../domain/exceptions/DuplicateRequestException.js';

describe('DuplicateRequestException', () => {
  it('should create exception with default message', () => {
    const exception = new DuplicateRequestException();
    
    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(DuplicateRequestException);
    expect(exception.name).toBe('DuplicateRequestException');
    expect(exception.message).toBe('Duplicate request: status is already set to this value');
  });

  it('should create exception with custom message', () => {
    const customMessage = 'Unit 123 already has status DELIVERED';
    const exception = new DuplicateRequestException(customMessage);
    
    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(DuplicateRequestException);
    expect(exception.name).toBe('DuplicateRequestException');
    expect(exception.message).toBe(customMessage);
  });

  it('should have stack trace', () => {
    const exception = new DuplicateRequestException();
    
    expect(exception.stack).toBeDefined();
    expect(exception.stack).toContain('DuplicateRequestException');
  });

  it('should be catchable as Error', () => {
    try {
      throw new DuplicateRequestException('Test error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DuplicateRequestException);
      if (error instanceof DuplicateRequestException) {
        expect(error.message).toBe('Test error');
      }
    }
  });
});
