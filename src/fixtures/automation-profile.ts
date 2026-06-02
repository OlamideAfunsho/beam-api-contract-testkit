export const automationProfileFixtures = {
  preDeployed: {
    id: "automation_profile_test",
    type: "automation_profile",
    status: "pending_deployment",
    profile: {
      address: null,
      deploymentState: "not_deployed",
      hasOnchainActivity: false,
    },
  },
} as const;
