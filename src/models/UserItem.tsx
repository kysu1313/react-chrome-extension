export interface UserItem {
  itemClass: string;
  rarity: string;
  name: string;
  baseType: string;
  quality?: string;
  evasionRating?: string;
  energyShield?: string;
  armour?: string;
  damagePerSecond?: string;
  attacksPerSecond?: string;
  critChance?: string;
  elementalDamage?: string;
  lightningDamage?: string;
  coldDamage?: string;
  fireDamage?: string;
  chaosDamage?: string;
  physicalDamage?: string;
  criticalHitChance?: string;
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
  // flavorText?: string[];
  corrupted?: boolean;
  waystoneTier?: string;
  waystoneDropChance?: string;
}