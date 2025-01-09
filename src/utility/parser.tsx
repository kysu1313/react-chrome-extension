import { UserItem } from "../models/UserItem";


function parseSockets(sockets: string | undefined): number {
    if (!sockets) {
      return 0;
    }
    return sockets.split(' ').length;
  }

  function parseItemClass(itemClass: string): string {
    const itemClasses = [
      'Any',
      'Any Weapon',
      'Any One-Handed Melee Weapon',
      'Unarmed',
      'Claw',
      'Dagger',
      'One-Handed Sword',
      'One-Handed Axe',
      'One-Handed Mace',
      'Spear',
      'Flail',
      'Any Two-Handed Melee Weapon',
      'Two-Handed Sword',
      'Two-Handed Axe',
      'Two-Handed Mace',
      'Warstaff',
      'Any Ranged Weapon',
      'Bow',
      'Crossbow',
      'Any Caster Weapon',
      'Wand',
      'Sceptre',
      'Staff',
      'Fishing Rod',
      'Any Armour',
      'Helmet',
      'Body Armour',
      'Gloves',
      'Boots',
      'Quiver',
      'Shield',
      'Focus',
      'Buckler',
      'Any Accessory',
      'Amulet',
      'Belt',
      'Ring',
      'Any Gem',
      'Skill Gem',
      'Support Gem',
      'Meta Gem',
      'Any Jewel',
      'Any Flask',
      'Life Flask',
      'Mana Flask',
      'Any Endgame Item',
      'Waystone',
      'Map Fragment',
      'Logbook',
      'Breachstone',
      'Barya',
      'Pinnacle Key',
      'Ultimatum Key',
      'Tablet',
      'Divination Card',
      'Relic',
      'Any Currency',
      'Omen',
      'Any Socketable',
      'Rune',
      'Soul Cor'
    ];
  
    for (const cls of itemClasses) {
      if (itemClass.includes(cls)) {
        return cls;
      }
    }
  
    return '';
  }

  function cleanValue(value: string | undefined): string {
    if (!value) return '';
    const index = value.indexOf('(');
    const cleanedValue = index !== -1 ? value.substring(0, index).trim() : value.trim();
    return cleanedValue.replace(/[^a-zA-Z0-9\s]/g, '');
  }
  
  // Function to parse the uploaded text
  export const parseItemText = (text: string): UserItem => {
    const lines = text.split('\n');
    const item: UserItem = {
      itemClass: parseItemClass(cleanValue(lines.find(line => line.startsWith('Item Class:'))?.split(': ')[1] || '')),
      rarity: lines.find(line => line.startsWith('Rarity:'))?.split(': ')[1] || '',
      name: lines[2] || '',
      baseType: lines[3] || '',
      quality: cleanValue(lines.find(line => line.startsWith('Quality:'))?.split(': ')[1]),
      evasionRating: lines.find(line => line.startsWith('Evasion Rating:'))?.split(': ')[1],
      energyShield: lines.find(line => line.startsWith('Energy Shield:'))?.split(': ')[1],
      armour: lines.find(line => line.startsWith('Armour:'))?.split(': ')[1],
      physicalDamage: lines.find(line => line.startsWith('Physical Damage:'))?.split(': ')[1],
      lightningDamage: lines.find(line => line.startsWith('Lightning Damage:'))?.split(': ')[1],
      criticalHitChance: lines.find(line => line.startsWith('Critical Hit Chance:'))?.split(': ')[1],
      attacksPerSecond: lines.find(line => line.startsWith('Attacks per Second:'))?.split(': ')[1],
      requirements: {
        level: lines.find(line => line.startsWith('Level:'))?.split(': ')[1] || '',
        str: cleanValue(lines.find(line => line.startsWith('Str:'))?.split(': ')[1]),
        dex: cleanValue(lines.find(line => line.startsWith('Dex:'))?.split(': ')[1]),
        int: cleanValue(lines.find(line => line.startsWith('Int:'))?.split(': ')[1]),
      },
      sockets: parseSockets(lines.find(line => line.startsWith('Sockets:'))?.split(': ')[1]),
      itemLevel: lines.find(line => line.startsWith('Item Level:'))?.split(': ')[1] || '',
      waystoneTier: lines.find(line => line.startsWith('Waystone Tier:'))?.split(': ')[1],
      waystoneDropChance: lines.find(line => line.startsWith('Waystone Drop Chance:'))?.split(': ')[1],
      enchant: lines.filter(line => line.includes('(enchant)')).map(line => line.split(' (enchant)')[0]),
      implicitMods: lines.filter(line => line.includes('(implicit)')).map(line => line.split(' (implicit)')[0]),
      explicitMods: lines.filter(line => line.includes('(explicit)')).map(line => line.split(' (explicit)')[0]),
      flavorText: lines.slice(lines.findIndex(line => line.startsWith('She thinks'))).filter(line => line !== '--------'),
      corrupted: lines.includes('Corrupted'),
    };
  
    return item;
  };