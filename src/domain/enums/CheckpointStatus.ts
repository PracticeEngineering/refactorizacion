export const CheckpointStatus = {
  CREATED: 'CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_FACILITY: 'AT_FACILITY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  EXCEPTION: 'EXCEPTION'
} as const;

export type CheckpointStatusType = typeof CheckpointStatus[keyof typeof CheckpointStatus];

export const VALID_STATUSES = Object.values(CheckpointStatus);

export function isValidStatus(status: string): status is CheckpointStatusType {
  return VALID_STATUSES.includes(status as CheckpointStatusType);
}
