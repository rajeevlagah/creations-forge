export class Monster {
  constructor() {
    this.name = "New Creature";
    this.level = 0;
    this.size = "med";
    this.rarity = "common";
    this.creatureType = "";

    this.traits = [];
    this.languages = [];

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

    this.skills = [];

    this.senses = [];

    this.resistances = [];
    this.weaknesses = [];
    this.immunities = [];

    this.items = [];
  }
}
