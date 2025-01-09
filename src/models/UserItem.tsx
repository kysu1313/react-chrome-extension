export interface UserItem {
  itemClass: string;
  rarity: string;
  name: string;
  baseType: string;
  quality?: string;
  evasionRating?: string;
  energyShield?: string;
  armour?: string;
  physicalDamage?: string;
  lightningDamage?: string;
  criticalHitChance?: string;
  attacksPerSecond?: string;
  requirements?: {
    level: string;
    str?: string;
    dex?: string;
    int?: string;
  };
  sockets?: number;
  itemLevel: string;
  enchant?: string[];
  implicitMods?: string[];
  explicitMods?: string[];
  flavorText?: string[];
  corrupted?: boolean;
  waystoneTier?: string;
  waystoneDropChance?: string;
}