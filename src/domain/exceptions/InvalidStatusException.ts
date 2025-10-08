export class InvalidStatusException extends Error {
  constructor(status: string, validStatuses: string[]) {
    super(`Invalid status '${status}'. Valid statuses are: ${validStatuses.join(', ')}`);
    this.name = 'InvalidStatusException';
  }
}
