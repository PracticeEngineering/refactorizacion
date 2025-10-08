export class DuplicateRequestException extends Error {
  constructor(message: string = 'Duplicate request: status is already set to this value') {
    super(message);
    this.name = 'DuplicateRequestException';
  }
}
