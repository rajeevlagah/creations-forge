// warnings.js

import { ALL_TRAITS } from "../data/traits.js";
import { PF2_LANGUAGES } from "../data/languages.js";

const VALID_TRAITS = new Set(
  ALL_TRAITS.map(t => t.slug)
);

const VALID_LANGUAGES = new Set(
  PF2_LANGUAGES
);

// PF2 creature-building baselines
const AC_BY_LEVEL = {
  "-1": { extreme: 18, high: 15, moderate: 14, low: 12 },
  "0": { extreme: 19, high: 16, moderate: 15, low: 13 },
  "1": { extreme: 19, high: 17, moderate: 16, low: 14 },
  "2": { extreme: 21, high: 18, moderate: 18, low: 15 },
  "3": { extreme: 22, high: 19, moderate: 19, low: 16 },
  "4": { extreme: 24, high: 21, moderate: 20, low: 18 },
  "5": { extreme: 25, high: 22, moderate: 22, low: 19 },
  "6": { extreme: 27, high: 24, moderate: 23, low: 21 },
  "7": { extreme: 28, high: 25, moderate: 25, low: 22 },
  "8": { extreme: 30, high: 27, moderate: 26, low: 24 },
  "9": { extreme: 31, high: 28, moderate: 28, low: 25 },
  "10": { extreme: 33, high: 30, moderate: 29, low: 27 },
  "11": { extreme: 34, high: 31, moderate: 31, low: 28 },
  "12": { extreme: 36, high: 33, moderate: 32, low: 30 },
  "13": { extreme: 37, high: 34, moderate: 34, low: 31 },
  "14": { extreme: 39, high: 36, moderate: 35, low: 33 },
  "15": { extreme: 40, high: 37, moderate: 37, low: 34 },
  "16": { extreme: 42, high: 39, moderate: 38, low: 36 },
  "17": { extreme: 43, high: 40, moderate: 40, low: 37 },
  "18": { extreme: 45, high: 42, moderate: 41, low: 39 },
  "19": { extreme: 46, high: 43, moderate: 43, low: 40 },
  "20": { extreme: 48, high: 45, moderate: 44, low: 42 },
  "21": { extreme: 49, high: 46, moderate: 46, low: 43 },
  "22": { extreme: 51, high: 48, moderate: 47, low: 45 },
  "23": { extreme: 52, high: 49, moderate: 49, low: 46 },
  "24": { extreme: 54, high: 51, moderate: 50, low: 48 }
};

const HP_BY_LEVEL = {
  "-1": { extreme: 9, high: 8, moderate: 7, low: 6 },
  "0": { extreme: 20, high: 17, moderate: 15, low: 13 },
  "1": { extreme: 26, high: 24, moderate: 21, low: 18 },
  "2": { extreme: 40, high: 36, moderate: 32, low: 28 },
  "3": { extreme: 59, high: 53, moderate: 48, low: 42 },
  "4": { extreme: 78, high: 72, moderate: 63, low: 54 },
  "5": { extreme: 97, high: 91, moderate: 78, low: 66 },
  "6": { extreme: 123, high: 115, moderate: 99, low: 84 },
  "7": { extreme: 148, high: 140, moderate: 119, low: 101 },
  "8": { extreme: 173, high: 165, moderate: 139, low: 118 },
  "9": { extreme: 198, high: 190, moderate: 159, low: 135 },
  "10": { extreme: 223, high: 215, moderate: 179, low: 152 },
  "11": { extreme: 248, high: 240, moderate: 199, low: 169 },
  "12": { extreme: 273, high: 265, moderate: 219, low: 186 },
  "13": { extreme: 298, high: 290, moderate: 239, low: 203 },
  "14": { extreme: 323, high: 315, moderate: 258, low: 220 },
  "15": { extreme: 348, high: 340, moderate: 278, low: 237 },
  "16": { extreme: 373, high: 365, moderate: 298, low: 254 },
  "17": { extreme: 398, high: 390, moderate: 318, low: 271 },
  "18": { extreme: 423, high: 415, moderate: 338, low: 288 },
  "19": { extreme: 448, high: 440, moderate: 358, low: 305 },
  "20": { extreme: 473, high: 465, moderate: 378, low: 322 },
  "21": { extreme: 505, high: 495, moderate: 400, low: 340 },
  "22": { extreme: 544, high: 530, moderate: 430, low: 365 },
  "23": { extreme: 581, high: 565, moderate: 458, low: 390 },
  "24": { extreme: 633, high: 615, moderate: 500, low: 425 }
};

const ABILITY_MOD_BY_LEVEL = {
  "-1": { extreme: 5, high: 4, moderate: 3, low: 1 },
  "0": { extreme: 5, high: 4, moderate: 3, low: 2 },
  "1": { extreme: 5, high: 4, moderate: 3, low: 2 },
  "2": { extreme: 6, high: 5, moderate: 4, low: 2 },
  "3": { extreme: 6, high: 5, moderate: 4, low: 3 },
  "4": { extreme: 7, high: 6, moderate: 5, low: 3 },
  "5": { extreme: 7, high: 6, moderate: 5, low: 3 },
  "6": { extreme: 8, high: 7, moderate: 5, low: 4 },
  "7": { extreme: 8, high: 7, moderate: 6, low: 4 },
  "8": { extreme: 9, high: 8, moderate: 6, low: 4 },
  "9": { extreme: 9, high: 8, moderate: 7, low: 5 },
  "10": { extreme: 10, high: 9, moderate: 7, low: 5 },
  "11": { extreme: 10, high: 9, moderate: 8, low: 5 },
  "12": { extreme: 11, high: 10, moderate: 8, low: 6 },
  "13": { extreme: 11, high: 10, moderate: 9, low: 6 },
  "14": { extreme: 12, high: 11, moderate: 9, low: 6 },
  "15": { extreme: 12, high: 11, moderate: 10, low: 7 },
  "16": { extreme: 13, high: 12, moderate: 10, low: 7 },
  "17": { extreme: 13, high: 12, moderate: 11, low: 7 },
  "18": { extreme: 14, high: 13, moderate: 11, low: 8 },
  "19": { extreme: 14, high: 13, moderate: 12, low: 8 },
  "20": { extreme: 15, high: 14, moderate: 12, low: 8 },
  "21": { extreme: 15, high: 14, moderate: 13, low: 9 },
  "22": { extreme: 16, high: 15, moderate: 13, low: 9 },
  "23": { extreme: 16, high: 15, moderate: 14, low: 9 },
  "24": { extreme: 17, high: 16, moderate: 14, low: 10 }
};

const SAVE_BY_LEVEL = {
  "-1": { extreme: 9, high: 8, moderate: 5, low: 2 },
  "0": { extreme: 10, high: 9, moderate: 6, low: 3 },
  "1": { extreme: 11, high: 10, moderate: 7, low: 4 },
  "2": { extreme: 12, high: 11, moderate: 8, low: 5 },
  "3": { extreme: 14, high: 12, moderate: 9, low: 6 },
  "4": { extreme: 15, high: 14, moderate: 11, low: 8 },
  "5": { extreme: 17, high: 15, moderate: 12, low: 9 },
  "6": { extreme: 18, high: 17, moderate: 14, low: 11 },
  "7": { extreme: 20, high: 18, moderate: 15, low: 12 },
  "8": { extreme: 21, high: 19, moderate: 16, low: 13 },
  "9": { extreme: 22, high: 21, moderate: 18, low: 15 },
  "10": { extreme: 24, high: 22, moderate: 19, low: 16 },
  "11": { extreme: 25, high: 23, moderate: 20, low: 17 },
  "12": { extreme: 27, high: 25, moderate: 22, low: 19 },
  "13": { extreme: 28, high: 26, moderate: 23, low: 20 },
  "14": { extreme: 30, high: 28, moderate: 25, low: 22 },
  "15": { extreme: 31, high: 29, moderate: 26, low: 23 },
  "16": { extreme: 33, high: 30, moderate: 27, low: 24 },
  "17": { extreme: 34, high: 32, moderate: 29, low: 26 },
  "18": { extreme: 36, high: 33, moderate: 30, low: 27 },
  "19": { extreme: 37, high: 34, moderate: 31, low: 28 },
  "20": { extreme: 39, high: 36, moderate: 33, low: 30 },
  "21": { extreme: 40, high: 37, moderate: 34, low: 31 },
  "22": { extreme: 42, high: 39, moderate: 36, low: 33 },
  "23": { extreme: 43, high: 40, moderate: 37, low: 34 },
  "24": { extreme: 45, high: 42, moderate: 39, low: 36 }
};

const PERCEPTION_BY_LEVEL = {
  "-1": { extreme: 9, high: 8, moderate: 5, low: 2 },
  "0": { extreme: 10, high: 9, moderate: 6, low: 3 },
  "1": { extreme: 11, high: 10, moderate: 7, low: 4 },
  "2": { extreme: 12, high: 11, moderate: 8, low: 5 },
  "3": { extreme: 14, high: 12, moderate: 9, low: 6 },
  "4": { extreme: 15, high: 14, moderate: 11, low: 8 },
  "5": { extreme: 17, high: 15, moderate: 12, low: 9 },
  "6": { extreme: 18, high: 17, moderate: 14, low: 11 },
  "7": { extreme: 20, high: 18, moderate: 15, low: 12 },
  "8": { extreme: 21, high: 19, moderate: 16, low: 13 },
  "9": { extreme: 22, high: 21, moderate: 18, low: 15 },
  "10": { extreme: 24, high: 22, moderate: 19, low: 16 },
  "11": { extreme: 25, high: 23, moderate: 20, low: 17 },
  "12": { extreme: 27, high: 25, moderate: 22, low: 19 },
  "13": { extreme: 28, high: 26, moderate: 23, low: 20 },
  "14": { extreme: 30, high: 28, moderate: 25, low: 22 },
  "15": { extreme: 31, high: 29, moderate: 26, low: 23 },
  "16": { extreme: 33, high: 30, moderate: 27, low: 24 },
  "17": { extreme: 34, high: 32, moderate: 29, low: 26 },
  "18": { extreme: 36, high: 33, moderate: 30, low: 27 },
  "19": { extreme: 37, high: 34, moderate: 31, low: 28 },
  "20": { extreme: 39, high: 36, moderate: 33, low: 30 },
  "21": { extreme: 40, high: 37, moderate: 34, low: 31 },
  "22": { extreme: 42, high: 39, moderate: 36, low: 33 },
  "23": { extreme: 43, high: 40, moderate: 37, low: 34 },
  "24": { extreme: 45, high: 42, moderate: 39, low: 36 }
};

const SKILL_BY_LEVEL = {
  "-1": { extreme: 8, high: 5, moderate: 4, low: 2 },
  "0": { extreme: 9, high: 6, moderate: 5, low: 3 },
  "1": { extreme: 10, high: 7, moderate: 6, low: 4 },
  "2": { extreme: 11, high: 8, moderate: 7, low: 5 },
  "3": { extreme: 13, high: 10, moderate: 8, low: 6 },
  "4": { extreme: 15, high: 12, moderate: 10, low: 7 },
  "5": { extreme: 16, high: 13, moderate: 11, low: 8 },
  "6": { extreme: 18, high: 15, moderate: 13, low: 10 },
  "7": { extreme: 20, high: 16, moderate: 14, low: 11 },
  "8": { extreme: 21, high: 18, moderate: 15, low: 12 },
  "9": { extreme: 23, high: 19, moderate: 17, low: 14 },
  "10": { extreme: 24, high: 21, moderate: 18, low: 15 },
  "11": { extreme: 26, high: 22, moderate: 19, low: 16 },
  "12": { extreme: 27, high: 24, moderate: 21, low: 18 },
  "13": { extreme: 29, high: 25, moderate: 22, low: 19 },
  "14": { extreme: 30, high: 27, moderate: 24, low: 21 },
  "15": { extreme: 32, high: 28, moderate: 25, low: 22 },
  "16": { extreme: 33, high: 30, moderate: 26, low: 23 },
  "17": { extreme: 35, high: 31, moderate: 28, low: 25 },
  "18": { extreme: 36, high: 33, moderate: 29, low: 26 },
  "19": { extreme: 38, high: 34, moderate: 30, low: 27 },
  "20": { extreme: 39, high: 36, moderate: 32, low: 29 },
  "21": { extreme: 41, high: 37, moderate: 33, low: 30 },
  "22": { extreme: 43, high: 39, moderate: 35, low: 32 },
  "23": { extreme: 44, high: 40, moderate: 36, low: 33 },
  "24": { extreme: 46, high: 42, moderate: 38, low: 35 }
};

function classifyValue(value, ranges) {

  if (value >= ranges.extreme) {
    return "extreme";
  }

  if (value >= ranges.high) {
    return "high";
  }

  if (value >= ranges.moderate) {
    return "moderate";
  }

  if (value >= ranges.low) {
    return "low";
  }

  return "terrible";
}

export function validateMonster(monster) {

  const warnings = [];

  const level =
    Number(monster.level || 0);

  // =========================
  // NAME
  // =========================

  if (!monster.name?.trim()) {
    warnings.push({
      field: "mon-name",
      severity: "terrible",
      message: "Monster is missing a name."
    });
  }

  // =========================
  // AC
  // =========================

  const ac =
    Number(monster.attributes?.ac || 0);

  const acRanges =
    AC_BY_LEVEL[level];

  if (acRanges) {

    const severity =
      classifyValue(ac, acRanges);

    warnings.push({
      field: "mon-ac",
      severity,
      message: `AC is rated '${severity}' for level ${level}.`
    });
  }

  // =========================
  // HP
  // =========================

  const hp =
  Number(monster.attributes?.hp || 0);

  const hpRanges =
    HP_BY_LEVEL[level];

  if (hpRanges) {

    const severity =
      classifyValue(hp, hpRanges);

    warnings.push({
      field: "mon-hp",
      severity,
      message: `HP is rated '${severity}' for level ${level}.`
    });
  }

  // =========================
  // SAVES
  // =========================

  ["fort", "ref", "will"].forEach(save => {

    const value =
      Number(monster.saves?.[save] || 0);

    const ranges =
      SAVE_BY_LEVEL[level];

    if (!ranges) return;

    const severity =
      classifyValue(value, ranges);

    warnings.push({
      field: `save-${save}`,
      severity,
      message: `${save} save is rated '${severity}'' for level ${level}.`
    });
  });

  // =========================
  // PERCEPTION
  // =========================

  const perception =
    Number(monster.attributes?.perception || 0);

  const perceptionRanges =
    PERCEPTION_BY_LEVEL[level];

    console.log(monster.attributes?.perception);

  if (perceptionRanges) {

    const severity =
      classifyValue(
        perception,
        perceptionRanges
      );

    warnings.push({
      field: "mon-perception",
      severity,
      message:
        `Perception is rated '${severity}' for level ${level}.`
    });
  }

  // =========================
  // ABILITY MODIFIERS
  // =========================

  [
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha"
  ].forEach(stat => {

    const value =
      Number(monster.abilities?.[stat] || 0);

    const ranges =
      ABILITY_MOD_BY_LEVEL[level];

    if (!ranges) return;

    const severity =
      classifyValue(value, ranges);

    warnings.push({
      field: `mod-${stat}`,
      severity,
      message: `${stat.toUpperCase()} modifier is rated '${severity}' for level ${level}.`
    });
  });

  // =========================
  // SKILLS
  // =========================

  [
    "acrobatics",
    "arcana",
    "athletics",
    "crafting",
    "deception",
    "diplomacy",
    "intimidation",
    "medicine",
    "nature",
    "occultism",
    "performance",
    "religion",
    "society",
    "stealth",
    "survival",
    "thievery"
  ].forEach(skill => {

    const skillData =
      monster.skills.find(s =>
        s.name?.toLowerCase() === skill
      );

    const value =
      Number(skillData?.bonus || 0);

    const ranges =
      SKILL_BY_LEVEL[level];

    if (!ranges) return;

    const severity =
      classifyValue(value, ranges);

    warnings.push({
      field: `skill-${skill}`,
      severity,
      message:
        `${skill} is rated '${severity}' for level ${level}.`
    });
  });

  // =========================
  // STRIKES
  // =========================

  const DAMAGE_REGEX =
    /^\d+d\d+(\s*[+-]\s*\d+)?/i;

  (monster.strikes || []).forEach((strike, i) => {

    if (!strike.damage ||
        !DAMAGE_REGEX.test(strike.damage)) {

      warnings.push({
        field: `strike-damage-${i}`,
        severity: "terrible",
        message: `${strike.name || "Strike"} has invalid damage formatting.`
      });
    }
  });

  return warnings;
}