export const STRIPE_CONFIG = {
  prices: {
    quarterly: {
      priceId: process.env.STRIPE_PRICE_QUARTERLY || 'price_quarterly_placeholder',
      amount: 2900, // 29€ in cents
      interval: 'quarter' as const,
      intervalCount: 3,
      name: {
        fr: 'Trimestriel',
        en: 'Quarterly',
        nl: 'Driemaandelijks',
      },
    },
    semiannual: {
      priceId: process.env.STRIPE_PRICE_SEMIANNUAL || 'price_semiannual_placeholder',
      amount: 4900, // 49€ in cents
      interval: 'semiannual' as const,
      intervalCount: 6,
      name: {
        fr: 'Semestriel',
        en: 'Semi-annual',
        nl: 'Halfjaarlijks',
      },
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_ANNUAL || 'price_annual_placeholder',
      amount: 9600, // 96€ in cents
      interval: 'year' as const,
      intervalCount: 12,
      name: {
        fr: 'Annuel',
        en: 'Annual',
        nl: 'Jaarlijks',
      },
    },
  },
  trialDays: 30,
  currency: 'eur',
} as const;

export type PlanKey = keyof typeof STRIPE_CONFIG.prices;

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(STRIPE_CONFIG.prices)) {
    if (plan.priceId === priceId) {
      return key as PlanKey;
    }
  }
  return null;
}
