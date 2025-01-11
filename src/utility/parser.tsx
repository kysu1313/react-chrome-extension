import { UserItem, Mod } from "../models/UserItem";

function parseSockets(sockets: string | undefined): number {
  if (!sockets) {
    return 0;
  }
  return sockets.split(" ").length;
}

function parseItemClass(itemClass: string): string {
  const itemClasses = [
    "Any",
    "Any Weapon",
    "Any One-Handed Melee Weapon",
    "Unarmed",
    "Claw",
    "Dagger",
    "One-Handed Sword",
    "One-Handed Axe",
    "One-Handed Mace",
    "Spear",
    "Flail",
    "Any Two-Handed Melee Weapon",
    "Two-Handed Sword",
    "Two-Handed Axe",
    "Two-Handed Mace",
    "Warstaff",
    "Any Ranged Weapon",
    "Bow",
    "Crossbow",
    "Any Caster Weapon",
    "Wand",
    "Sceptre",
    "Staff",
    "Fishing Rod",
    "Any Armour",
    "Helmet",
    "Body Armour",
    "Gloves",
    "Boots",
    "Quiver",
    "Shield",
    "Focus",
    "Buckler",
    "Any Accessory",
    "Amulet",
    "Belt",
    "Ring",
    "Any Gem",
    "Skill Gem",
    "Support Gem",
    "Meta Gem",
    "Any Jewel",
    "Any Flask",
    "Life Flask",
    "Mana Flask",
    "Any Endgame Item",
    "Waystone",
    "Map Fragment",
    "Logbook",
    "Breachstone",
    "Barya",
    "Pinnacle Key",
    "Ultimatum Key",
    "Tablet",
    "Divination Card",
    "Relic",
    "Any Currency",
    "Omen",
    "Any Socketable",
    "Rune",
    "Soul Cor",
  ];

  for (const cls of itemClasses) {
    if (itemClass.includes(cls)) {
      return cls;
    }
  }

  return "";
}

function getModValue(value: string | undefined): string {
  if (!value) return "";
  let regex = /(\d+)\s*to\s*(\d+)\s*(.*)/;
  const match = value.match(regex);
  if (match) {
    const num1 = parseInt(match[1], 10);
    const num2 = parseInt(match[2], 10);
    const average = Math.floor((num1 + num2) / 2);
    const restOfString = match[3].trim();
    return `${average} ${restOfString}`;
  }

  regex = /\d+/g;
  const numbers = value.match(regex);
  if (numbers) {
    const sum = numbers.reduce((acc, curr) => acc + parseInt(curr, 10), 0);
    return `${sum}`;
  }

  return value;
}

function cleanValue(value: string | undefined): string {
  if (!value) return "";
  const index = value.indexOf("(");
  const cleanedValue =
    index !== -1 ? value.substring(0, index).trim() : value.trim();
  return cleanedValue.replace(/[^a-zA-Z0-9\s]/g, "");
}

function extractModtext(value: string): string {
  const regex = /(?:\d+\s*to\s*\d+|\d+)\s*(.*)/;
  const match = value.match(regex);
  if (match) {
    return cleanValue(match[1].trim());
  }
  return "";
}

let cachedMods: string[] | null = null;

const fetchModsFile = async (): Promise<string[]> => {
  if (cachedMods) {
    return cachedMods;
  }

  const fileUrl = chrome.runtime.getURL("data/mods.txt");
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error("Failed to load mods file");
  }

  const text = await response.text();
  cachedMods = text.split("\n").map((line) => line.trim());

  return cachedMods;
};

const extractExplicitMods = async (lines: string[]): Promise<Mod[]> => {
  const possibleMods = await fetchModsFile();

  console.log("Possible mods:", possibleMods);

  let lineIndex = lines.findIndex((x) => x.includes("(implicit)"));
  console.log("First line index:", lineIndex);

  if (lineIndex === -1) {
    lineIndex = lines.findIndex((x) => x.includes("(enchant)"));
    if (lineIndex === -1) {
      lineIndex = lines.findIndex((x) => x.includes("(rune)"));
      if (lineIndex === -1) {
        lineIndex = lines.findIndex((x) => x.includes("Item Level"));
      }
    }
  }

  let afterFirstDivider = lines.slice(lineIndex + 1);
  afterFirstDivider = afterFirstDivider.slice(1);

  if (afterFirstDivider[0].includes("-------")) {
    afterFirstDivider = afterFirstDivider.slice(1);
  }

  afterFirstDivider = afterFirstDivider.slice(
    0,
    afterFirstDivider.findIndex((x) => x.includes("-------"))
  );

  const explicitMods = afterFirstDivider.filter(
    (line) => line.trim() !== "--------"
  );

  return explicitMods
    .map((line) => line.trim())
    .filter((line) =>
      possibleMods.some((mod) => line.includes(extractModtext(mod)))
    )
    .map((line) => {
      const modText = possibleMods.find((mod) => {
        const extractedModText = extractModtext(line);
        return mod.includes(extractedModText);
      });

      const value = getModValue(line.trim());
      return { value, name: modText } as Mod;
    });
};

const extractImplicitMods = async (lines: string[]): Promise<Mod[]> => {
  const possibleMods = await fetchModsFile();
  let lineIndex = lines.findIndex((x) => x.includes("(implicit)"));

  if (lineIndex === -1) {
    return [];
  }

  var implicitMod = lines[lineIndex];

  const modText = possibleMods.find((mod) =>
    implicitMod.includes(extractModtext(mod))
  );
  const value = getModValue(implicitMod.trim());
  return [{ value, name: modText }] as Mod[];
};

// Function to parse the uploaded text
export const parseItemText = async (text: string): Promise<UserItem> => {
  const noteIndex = text.indexOf("Note:");
  let cleanedText = text;
  if (noteIndex !== -1) {
    const precedingDividerIndex = text.lastIndexOf("--------", noteIndex);
    cleanedText = text.substring(0, precedingDividerIndex).trim();
  }

  console.log("Cleaned text:", cleanedText);
  const lines = cleanedText.split("\n");
  const explicitMods = await extractExplicitMods(lines);
  const implicitMods = await extractImplicitMods(lines);

  const item: UserItem = {
    itemClass: parseItemClass(
      cleanValue(
        lines.find((line) => line.startsWith("Item Class:"))?.split(": ")[1] ||
          ""
      )
    ),
    rarity:
      lines.find((line) => line.startsWith("Rarity:"))?.split(": ")[1] || "",
    name: lines[2] || "",
    baseType: lines[3] || "",
    quality: cleanValue(
      lines.find((line) => line.startsWith("Quality:"))?.split(": ")[1]
    ),
    evasionRating: cleanValue(
      lines.find((line) => line.startsWith("Evasion Rating:"))?.split(": ")[1]
    ),
    energyShield: cleanValue(
      lines.find((line) => line.startsWith("Energy Shield:"))?.split(": ")[1]
    ),
    armour: cleanValue(
      lines.find((line) => line.startsWith("Armour:"))?.split(": ")[1]
    ),
    physicalDamage: getModValue(
      lines.find((line) => line.startsWith("Physical Damage:"))?.split(": ")[1]
    ),
    lightningDamage: getModValue(
      lines.find((line) => line.startsWith("Lightning Damage:"))?.split(": ")[1]
    ),
    coldDamage: getModValue(
      lines.find((line) => line.startsWith("Cold Damage:"))?.split(": ")[1]
    ),
    fireDamage: getModValue(
      lines.find((line) => line.startsWith("Fire Damage:"))?.split(": ")[1]
    ),
    chaosDamage: getModValue(
      lines.find((line) => line.startsWith("Chaos Damage:"))?.split(": ")[1]
    ),
    criticalHitChance: lines
      .find((line) => line.startsWith("Critical Hit Chance:"))
      ?.split(": ")[1],
    attacksPerSecond: lines
      .find((line) => line.startsWith("Attacks per Second:"))
      ?.split(": ")[1],
    requirements: {
      level:
        lines.find((line) => line.startsWith("Level:"))?.split(": ")[1] || "",
      str: cleanValue(
        lines.find((line) => line.startsWith("Str:"))?.split(": ")[1]
      ),
      dex: cleanValue(
        lines.find((line) => line.startsWith("Dex:"))?.split(": ")[1]
      ),
      int: cleanValue(
        lines.find((line) => line.startsWith("Int:"))?.split(": ")[1]
      ),
    },
    sockets: parseSockets(
      lines.find((line) => line.startsWith("Sockets:"))?.split(": ")[1]
    ),
    itemLevel:
      lines.find((line) => line.startsWith("Item Level:"))?.split(": ")[1] ||
      "",
    waystoneTier: lines
      .find((line) => line.startsWith("Waystone Tier:"))
      ?.split(": ")[1],
    waystoneDropChance: lines
      .find((line) => line.startsWith("Waystone Drop Chance:"))
      ?.split(": ")[1],
    enchant: lines
      .filter((line) => line.includes("(enchant)"))
      .map((line) => line.split(" (enchant)")[0]),
    implicitMods: implicitMods,
    explicitMods: explicitMods,
    corrupted: lines.includes("Corrupted"),
  };

  return item;
};
