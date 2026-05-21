// monster.js
export class Monster {
  constructor() {
    this.name = "New Creature";
    this.level = 0;
    this.size = "med";          // "tiny" | "sm" | "med" | "lg" | "huge" | "grg"
    this.rarity = "common";     // "common" | "uncommon" | "rare" | "unique"

    this.traits = [];           // ["dragon", "fire", ...]
    this.languages = [];        // ["Common", "Draconic", ...]

    this.details = {
      description: "",
      publicNotes: "",
      privateNotes: ""
    };

    this.attributes = {
      ac: 0,
      hp: 0,
      speed: 25,
      perception: 0
    };

    this.abilities = {
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0
    };

    this.saves = {
      fortitude: 0,
      reflex: 0,
      will: 0
    };

    // PF2 skills as array of { name, bonus }
    this.skills = [];

    // Senses as array of strings: ["darkvision", "tremorsense 60 feet"]
    this.senses = [];

    this.resistances = [];  // [{ type, value, note }]
    this.weaknesses = [];   // [{ type, value, note }]
    this.immunities = [];   // ["poison", "death effects"]

    // Strikes: jaws, claw, etc.
    this.strikes = [];      // [{ name, bonus, damage, traits: [] }]

    // Action abilities (offensive/defensive/etc.)
    this.abilitiesList = []; // [{ name, type, cost, traits: [], description }]

    // Spellcasting blocks
    this.spellcasting = [];  // [{ type, tradition, dc, attack, groups: [{ label, spells }] }]

    this.items = [];         // not used directly; exporter builds items array
  }
}
