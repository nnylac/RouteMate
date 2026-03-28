export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

// Valid state transitions — enforced in service layer
export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> =
  {
    [TransactionStatus.PENDING]: [
      TransactionStatus.SUCCESS,
      TransactionStatus.FAILED,
      TransactionStatus.ROLLED_BACK,
    ],
    [TransactionStatus.SUCCESS]: [TransactionStatus.ROLLED_BACK], // refund path
    [TransactionStatus.FAILED]: [],
    [TransactionStatus.ROLLED_BACK]: [],
  };
