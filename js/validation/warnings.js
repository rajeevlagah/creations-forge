export function validateMonster(monster) {
  const warnings = [];
  const EXPECTED_AC = {
    "-1": 14, 0: 15, 1: 16, 2: 18, 3: 19, 4: 21, 5: 22,
    6: 24, 7: 25, 8: 27, 9: 28, 10: 30,
    // … you can fill the rest later
  };
  const EXPECTED_HP = {
    "-1": 8, 0: 15, 1: 25, 2: 35, 3: 45, 4: 60, 5: 75,
    6: 90, 7: 110, 8: 130, 9: 150, 10: 175,
  };
  const EXPECTED_ATTACK = {
    "-1": 6, 0: 7, 1: 8, 2: 10, 3: 11, 4: 13, 5: 14,
    6: 16, 7: 17, 8: 19, 9: 20, 10: 22,
  };


  // Required fields
  if (!monster.name) warnings.push("Monster has no name.");
  if (monster.level === null || monster.level === undefined) warnings.push("Monster has no level.");
  if (!monster.size) warnings.push("Monster has no size.");
  if (!monster.creatureType) warnings.push("Monster has no creature type.");

  // Basic numeric checks
  if (monster.ac <= 0) warnings.push("AC is unusually low or missing.");
  if (EXPECTED_AC[monster.level] !== undefined) {
    const expected = EXPECTED_AC[monster.level];
    if (monster.ac < expected - 2) {
      warnings.push(`AC is low for level ${monster.level} (expected around ${expected}).`);
    }
    if (monster.ac > expected + 2) {
      warnings.push(`AC is high for level ${monster.level} (expected around ${expected}).`);
    }
  }

  if (monster.hp <= 0) warnings.push("HP is unusually low or missing.");
  if (EXPECTED_HP[monster.level] !== undefined) {
    const expected = EXPECTED_HP[monster.level];
    if (monster.hp < expected * 0.7) {
      warnings.push(`HP is low for level ${monster.level} (expected around ${expected}).`);
    }
    if (monster.hp > expected * 1.3) {
      warnings.push(`HP is high for level ${monster.level} (expected around ${expected}).`);
    }
  }

  // Ability score sanity
  Object.entries(monster.abilityMods).forEach(([key, mod]) => {
    if (mod < -5 || mod > 10) {
      warnings.push(`Ability modifier ${key.toUpperCase()} is outside expected range.`);
    }
  });

  // Strikes
  monster.strikes.forEach(s => {
    const expected = EXPECTED_ATTACK[monster.level];
    if (expected !== undefined) {
      if (s.bonus < expected - 2) {
        warnings.push(`Strike "${s.name}" has a low attack bonus for level ${monster.level}.`);
      }
      if (s.bonus > expected + 2) {
        warnings.push(`Strike "${s.name}" has a high attack bonus for level ${monster.level}.`);
      }
    }
  });
  
  return warnings;
}
