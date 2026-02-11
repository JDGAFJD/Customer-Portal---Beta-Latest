export interface AddonDefinition {
  id: string;
  family: string;
  itemPriceId: string;
  displayName: string;
  price: number;
  billingPeriod: string;
  headline: string;
  bullets: string[];
  upsellMessage: string;
  retentionMessage: string;
  retentionBullets: string[];
  icon: 'travel' | 'shield' | 'speed' | 'support';
}

export const AVAILABLE_ADDONS: AddonDefinition[] = [
  {
    id: 'travel-addon',
    family: 'travel',
    itemPriceId: 'Updated-Nomad-Travel-1995-USD-Monthly',
    displayName: 'Nomad Travel Add-on',
    price: 19.95,
    billingPeriod: 'month',
    headline: 'Stay connected wherever you roam',
    bullets: [
      'Use your internet service while traveling anywhere in the US',
      'Seamless connectivity across different locations',
      'Enables subscription pause when you need a break',
      'No interruptions to your service when you move',
    ],
    upsellMessage: 'Most popular add-on! Perfect for customers who travel or plan to pause their service in the future.',
    retentionMessage: 'Are you sure? Without the Travel Add-on, you will lose the ability to pause your subscription and use your service while traveling.',
    retentionBullets: [
      'You will no longer be able to pause your subscription',
      'Traveling with your device may cause service interruptions',
      'You will need to re-purchase this add-on if you change your mind',
      'Your prorated refund for the remaining period will be applied',
    ],
    icon: 'travel',
  },
];

export const TRAVEL_ADDON_FAMILY_MATCHERS = [
  'travel-upgrade',
  'travel-modem',
  'nomad-travel',
];

export const TRAVEL_ADDON_EXACT_IDS = [
  'Updated-Nomad-Travel-1995-USD-Monthly',
  'Nomad-Travel-Upgrade-1000-USD-Monthly',
  'Nomad-Travel-Upgrade-1000',
  'Nomad-Travel-Upgrade-10.00',
  'Travel-Pause-Service-USD-Monthly',
];

export function isAddonInFamily(itemPriceId: string, family: string): boolean {
  if (family === 'travel') {
    const lower = itemPriceId.toLowerCase();
    if (TRAVEL_ADDON_FAMILY_MATCHERS.some(m => lower.includes(m))) return true;
    if (TRAVEL_ADDON_EXACT_IDS.includes(itemPriceId)) return true;
    if (lower.includes('travel-pause')) return true;
  }
  return false;
}

export function getAddonByFamily(family: string): AddonDefinition | null {
  return AVAILABLE_ADDONS.find(a => a.family === family) || null;
}

export function getAvailableAddonsForSubscription(
  currentItems: Array<{ itemPriceId: string; itemType: string }>
): { available: AddonDefinition[]; alreadyActive: AddonDefinition[] } {
  const available: AddonDefinition[] = [];
  const alreadyActive: AddonDefinition[] = [];

  for (const addon of AVAILABLE_ADDONS) {
    const hasIt = currentItems.some(item =>
      item.itemType === 'addon' && isAddonInFamily(item.itemPriceId, addon.family)
    );
    if (hasIt) {
      alreadyActive.push(addon);
    } else {
      available.push(addon);
    }
  }

  return { available, alreadyActive };
}
