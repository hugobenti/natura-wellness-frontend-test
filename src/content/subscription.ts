export const subscriptionContent = {
  title: "My subscription",
  loading: "Loading your subscription…",
  loadError: {
    title: "We couldn't load your subscription",
    body: "Please try again, or contact support.",
    retry: "Try again",
  },
  support: {
    label: "Contact support",
    href: "mailto:support@naturawellness.example?subject=My%20subscription",
  },
  receipt: {
    headingActive: "Next box",
    headingPaused: (date: string) => `Paused until ${date}`,
    headingPausedOpen: "Paused until you resume",
    headingCancelled: (date: string) => `Cancelled on ${date}`,
    quantity: (quantity: number) => `Qty ${quantity}`,
    charged: (date: string) => `Charged ${date}`,
    every: (days: number) => `Every ${days} days`,
    saving: (amount: string) => `You save ${amount}`,
    pausedTotal: "No charges while paused",
    pausedNext: (date: string, amount: string) => `Your next box: ${date} · ${amount}`,
    pausedOpenNext: "Resume any time to restart your boxes",
    cancelledTotal: "No more charges",
  },
} as const;
