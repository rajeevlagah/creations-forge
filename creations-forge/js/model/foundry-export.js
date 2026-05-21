function slugify(text) {
  return text
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildTraitObject(traits) {
  return {
    value: traits.map(slugify)
  };
}

function buildLanguages(languages) {
  return {
    value: languages.map(slugify),
    details: ""
  };
}

function buildSkills(skills) {
  const output = {};

  skills.forEach(skill => {
    output[slugify(skill.name)] = {
      base: Number(skill.bonus || 0)
    };
  });

  return output;
}

function buildResistances(resistances) {
  return resistances.map(r => ({
    type: slugify(r.type),
    value: Number(r.value || 0),
    exceptions: r.note || ""
  }));
}

function buildWeaknesses(weaknesses) {
  return weaknesses.map(w => ({
    type: slugify(w.type),
    value: Number(w.value || 0),
    exceptions: w.note || ""
  }));
}

function buildImmunities(immunities) {
  return immunities.map(i => ({
    type: slugify(i)
  }));
}

function buildStrikeItem(strike) {
  return {
    name: strike.name,
    type: "melee",

    system: {
      weaponType: {
        value: strike.weaponType || "melee"
      },

      bonus: {
        value: Number(strike.attackBonus || 0)
      },

      damageRolls: {
        primary: {
          damage: strike.damage || "1d6",
          damageType: strike.damageType || "bludgeoning"
        }
      },

      traits: {
        value: (strike.traits || []).map(slugify)
      },

      attackEffects: {
        value: []
      }
    }
  };
}

function buildAbilityItem(ability) {

  let actionType = "passive";
  let actions = null;

  if (ability.type === "action") {
    actionType = "action";
    actions = Number(ability.cost || 1);
  }

  if (ability.type === "reaction") {
    actionType = "reaction";
  }

  if (ability.type === "free") {
    actionType = "free";
  }

  return {
    name: ability.name,
    type: "action",

    system: {

      category: ability.category || "offensive",

      actionType: {
        value: actionType
      },

      actions: {
        value: actions
      },

      traits: {
        value: (ability.traits || []).map(slugify)
      },

      description: {
        value: ability.description || ""
      }
    }
  };
}

export function buildFoundryActor(monster) {

  const actor = {
    name: monster.name,

    type: "npc",

    img: "systems/pf2e/icons/default-icons/npc.svg",

    system: {

      details: {
        level: {
          value: Number(monster.level || 0)
        },

        publicNotes: monster.details.publicNotes || "",

        privateNotes: monster.details.privateNotes || ""
      },

      traits: {
        value: buildTraitObject(monster.traits).value,

        rarity: monster.rarity || "common",

        size: {
          value: monster.size || "med"
        },

        languages: buildLanguages(monster.languages)
      },

      abilities: {
        str: {
          mod: Number(monster.abilities.str || 0)
        },

        dex: {
          mod: Number(monster.abilities.dex || 0)
        },

        con: {
          mod: Number(monster.abilities.con || 0)
        },

        int: {
          mod: Number(monster.abilities.int || 0)
        },

        wis: {
          mod: Number(monster.abilities.wis || 0)
        },

        cha: {
          mod: Number(monster.abilities.cha || 0)
        }
      },

      attributes: {

        ac: {
          value: Number(monster.attributes.ac || 0)
        },

        hp: {
          max: Number(monster.attributes.hp || 0),
          value: Number(monster.attributes.hp || 0)
        },

        speed: {
          value: Number(monster.attributes.speed || 25)
        }
      },

      saves: {

        fortitude: {
          value: Number(monster.saves.fortitude || 0)
        },

        reflex: {
          value: Number(monster.saves.reflex || 0)
        },

        will: {
          value: Number(monster.saves.will || 0)
        }
      },

      skills: buildSkills(monster.skills),

      attributesExtra: {
        resistances: buildResistances(monster.resistances),
        weaknesses: buildWeaknesses(monster.weaknesses),
        immunities: buildImmunities(monster.immunities)
      }
    },

    items: []
  };

  const strikeItems =
    (monster.strikes || []).map(buildStrikeItem);

  const abilityItems =
    (monster.abilitiesList || []).map(buildAbilityItem);

  actor.items.push(...strikeItems);
  actor.items.push(...abilityItems);

  return actor;
}