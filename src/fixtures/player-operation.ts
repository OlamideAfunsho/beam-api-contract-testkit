export const playerOperationFixtures = {
  success: {
    id: "op_test_success",
    type: "operation",
    status: "processed",
    result: {
      approvalState: "approved",
      txHash: "0xplayeroperationsuccess",
    },
  },
  rejected: {
    id: "op_test_rejected",
    type: "operation",
    status: "rejected",
    result: {
      approvalState: "rejected",
      reason: "user_rejected",
    },
  },
} as const;
