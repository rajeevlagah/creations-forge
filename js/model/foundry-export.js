// ===============================
// Corrected & Improved buildFoundryActor()
// ===============================

import { PF2_LANGUAGES } from "../data/languages.js";

export function buildFoundryActor(monster) {

  function slugify(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function parseSignedNumber(value) {
    if (value === undefined || value === null) return 0;
    return Number(value.toString().replace(/\+/g, "")) || 0;
  }

  function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase()
      + text.slice(1);
  }

  function randomID() {
    return crypto.getRandomValues(new Uint8Array(16))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
      .slice(0, 16);
  }

  // -------------------------------
  // Languages
  // -------------------------------
  const CORE_LANGUAGES = new Set(
    PF2_LANGUAGES.map(slugify)
  );

  function buildLanguages(langs = []) {
    const core = [];
    const custom = [];

    langs.map(slugify).forEach(lang => {
      if (CORE_LANGUAGES.has(lang)) core.push(lang);
      else custom.push(lang);
    });

    return {
      value: core,
      details: custom.join(", ")
    };
  }

  // -------------------------------
  // Skills + Lore
  // -------------------------------
  function buildSkills(skills = []) {

    const output = {};

    skills.forEach(s => {

      const key = slugify(s.name);

      output[key] = {
        rank: 0,
        base: parseSignedNumber(s.bonus),
        special: []
      };
    });

    return output;
  }

  function buildLoreItem(lore) {

    const bonus =
      parseSignedNumber(lore.bonus);

    return {

      _id: randomID(),

      img: "systems/pf2e/icons/default-icons/lore.svg",

      name: lore.name,

      type: "lore",

      system: {

        description: {
          value: "",
          gm: ""
        },

        rules: [],

        slug: slugify(lore.name),

        traits: {
          otherTags: []
        },

        mod: {
          value: bonus
        },

        variants: {},

        item: {},

        statistic: {
          check: {
            type: "skill-check"
          },

          dc: {
            value: bonus + 10
          }
        },

        proficient: {
          value: 1
        },

        publication: {
          title: "",
          authors: "",
          license: "ORC",
          remaster: true
        },

        _migration: {
          version: 0.959,
          previous: null
        }
      }
    };
  }

  // -------------------------------
  // Defenses
  // -------------------------------
  function buildResistances(list = []) {
    return list.map(r => ({
      type: slugify(r.type),
      value: Number(r.value || 0),

      exceptions:
        Array.isArray(r.note)
          ? r.note.map(slugify)
          : [],

      doubleVs:
        (r.doubleVs || []).map(slugify)
    }));
  }

  function buildWeaknesses(list = []) {
    return list.map(w => ({
      type: slugify(w.type),
      value: Number(w.value || 0),

      exceptions:
        Array.isArray(w.note)
          ? w.note.map(slugify)
          : []
      }));
  }

  function buildImmunities(list = []) {
    return list.map(i => ({
      type: slugify(i)
    }));
  }

  // -------------------------------
  // Speed Parsing
  // -------------------------------
  function parseSpeeds(speedString = "") {
    const baseMatch = speedString.match(/(\d+)/);
    const base = baseMatch ? Number(baseMatch[1]) : 25;

    const other = [];

    const patterns = [
      { type: "fly", regex: /fly\s+(\d+)/i },
      { type: "burrow", regex: /burrow\s+(\d+)/i },
      { type: "swim", regex: /swim\s+(\d+)/i },
      { type: "climb", regex: /climb\s+(\d+)/i }
    ];

    patterns.forEach(p => {
      const m = speedString.match(p.regex);
      if (m) {
        other.push({
          type: p.type,
          value: Number(m[1])
        });
      }
    });

    return { base, other };
  }

  // -------------------------------
  // Damage Parsing
  // -------------------------------
  function parseDamageRolls(dmg = "") {
    const rolls = {};
    const parts = dmg.split(/\s+plus\s+/i).map(s => s.trim());

    parts.forEach(part => {
      const match = part.match(/^(.+?)\s+([a-zA-Z-]+)$/);
      if (!match) return;

      rolls[randomID()] = {
        damage: match[1],
        damageType: slugify(match[2]),
        category: null
      };
    });

    return rolls;
  }

  // -------------------------------
  // Strike Item
  // -------------------------------
  function buildStrikeItem(strike) {
    return {
      _id: randomID(),
      name: strike.name || "Strike",
      type: "melee",
      img: "systems/pf2e/icons/default-icons/melee.svg",
      system: {
        action: "strike",
        systemType: "melee",
        weaponType: { value: "melee" },
        bonus: { value: parseSignedNumber(strike.bonus) },
        damageRolls: parseDamageRolls(strike.damage),
        traits: {
          value: (strike.traits || []).map(slugify),
          otherTags: [],
          config: {}
        },
        attackEffects: { value: [] },
        range: null,
        subjectToMAP: true,
        area: null,
        rules: [],
        slug: null,
        description: { value: "", gm: "" },
        publication: {
          title: "",
          authors: "",
          license: "ORC",
          remaster: true
        },
        _migration: { version: 0.959, previous: null }
      }
    };
  }

  // -------------------------------
  // Ability Item
  // -------------------------------
  function buildAbilityItem(ability) {
    let actionType = "passive";
    let actions = { value: null };

    if (ability.type === "action") {
      actionType = "action";
      actions = { value: Number(ability.cost || 1) };
    } else if (ability.type === "reaction") {
      actionType = "reaction";
    } else if (ability.type === "free") {
      actionType = "free";
    }

    return {
      _id: randomID(),
      name: ability.name || "Ability",
      type: "action",
      img: "systems/pf2e/icons/default-icons/action.svg",
      system: {
        category: ability.category || "offensive",
        actionType: { value: actionType },
        actions,
        traits: {
          value: (ability.traits || []).map(slugify),
          otherTags: []
        },
        description: { value: ability.description || "", gm: "" },
        rules: [],
        slug: null,
        publication: {
          title: "",
          authors: "",
          license: "ORC",
          remaster: true
        },
        _migration: { version: 0.959, previous: null }
      }
    };
  }

  function buildSpellcastingItems(entries = []) {

    return entries.map(entry => ({

      _id: randomID(),

      name:
        `${capitalize(entry.tradition)} ${capitalize(entry.type)} Spells`,

      type: "spellcastingEntry",

      system: {
        tradition: {
          value: entry.tradition || "arcane"
        },

        prepared: {
          value:
            entry.type === "prepared"
              ? "prepared"
              : "spontaneous"
        },

        category: {
          value:
            entry.type || "prepared"
        },

        spelldc: {
          dc: Number(entry.dc || 0),
          value: Number(entry.attack || 0)
        },

        slots: {},

        showUnpreparedSpells: {
          value: true
        }
      }
    }));
  }

  function buildSpellcastingNotes(entries = []) {

    if (!entries.length) {
      return "";
    }

    return entries.map(entry => {

      const title =
        `${capitalize(entry.tradition)} ${capitalize(entry.type)} Spells`;

      const dc =
        entry.dc
          ? `DC ${entry.dc}`
          : "";

      const attack =
        entry.attack
          ? `attack ${entry.attack >= 0 ? "+" : ""}${entry.attack}`
          : "";

      const details =
        [dc, attack]
          .filter(Boolean)
          .join(", ");

      const groups =
        (entry.groups || [])
          .map(group =>
            `<p><strong>${group.label}</strong> ${group.spells}</p>`
          )
          .join("");

      return `
        <h3>${title}</h3>

        ${
          details
            ? `<p>${details}</p>`
            : ""
        }

        ${groups}
      `;
    }).join("<hr>");
  }

  // -------------------------------
  // Build Actor
  // -------------------------------
  const speeds = parseSpeeds(monster.attributes?.speed || "25");

  const actor = {
    name: monster.name || "Unnamed Creature",
    type: "npc",
    img: "systems/pf2e/icons/default-icons/npc.svg",

    prototypeToken: {
      flags: {
        pf2e: {
          linkToActorSize: true,
          autoscale: true
        }
      },
      height: 1,
      width: 1,
      name: monster.name || "Unnamed Creature",
      displayName: 20,
      actorLink: false,
      depth: 1,
      texture: {
        src: "systems/pf2e/icons/default-icons/npc.svg",
        anchorX: 0.5,
        anchorY: 0.5,
        fit: "contain",
        scaleX: 1,
        scaleY: 1,
        tint: "#ffffff",
        alphaThreshold: 0.75
      },
      lockRotation: true,
      rotation: 0,
      alpha: 1,
      disposition: -1,
      displayBars: 20,
      bar1: { attribute: "attributes.hp" },
      bar2: { attribute: null },
      light: {
        negative: false,
        priority: 0,
        alpha: 0.5,
        angle: 360,
        bright: 0,
        color: null,
        coloration: 1,
        dim: 0,
        attenuation: 0.5,
        luminosity: 0.5,
        saturation: 0,
        contrast: 0,
        shadows: 0,
        animation: {
          type: null,
          speed: 5,
          intensity: 5,
          reverse: false
        },
        darkness: { min: 0, max: 1 }
      },
      sight: {
        enabled: false,
        range: 0,
        angle: 360,
        visionMode: "basic",
        color: null,
        attenuation: 0.1,
        brightness: 0,
        saturation: 0,
        contrast: 0
      },
      detectionModes: {},
      occludable: { radius: 0 },
      ring: {
        enabled: false,
        colors: { ring: null, background: null },
        effects: 1,
        subject: { scale: 1, texture: null }
      },
      turnMarker: {
        mode: 1,
        animation: null,
        src: null,
        disposition: false
      },
      movementAction: null,
      randomImg: false,
      appendNumber: false,
      prependAdjective: false
    },

    system: {
      details: {
        level: { value: Number(monster.level || 0) },
        description: {
          value: monster.details?.description || "",
          gm: ""
        },
        publicNotes: buildSpellcastingNotes(
          monster.spellcasting || []
        ),
        privateNotes: monster.details?.privateNotes || "",
        source: {
          value: monster.details?.source || "",
          custom: ""
        },
        languages: buildLanguages(monster.languages || []),
        blurb: "",
        publication: {
          title: "test",
          authors: "???",
          license: "ORC",
          remaster: true
        }
      },

      traits: {
        value: (monster.traits || []).map(slugify),
        rarity: slugify(monster.rarity || "common"),
        size: { value: slugify(monster.size) }
      },

      abilities: {
        str: { mod: parseSignedNumber(monster.abilities?.str) },
        dex: { mod: parseSignedNumber(monster.abilities?.dex) },
        con: { mod: parseSignedNumber(monster.abilities?.con) },
        int: { mod: parseSignedNumber(monster.abilities?.int) },
        wis: { mod: parseSignedNumber(monster.abilities?.wis) },
        cha: { mod: parseSignedNumber(monster.abilities?.cha) }
      },

      perception: {
        mod: parseSignedNumber(monster.attributes?.perception),
        senses: monster.senses || [],
        details: "",
        vision: true
      },

      initiative: { statistic: "perception" },

      attributes: {
        ac: { value: Number(monster.attributes?.ac || 0), details: "" },

        hp: {
          value: Number(monster.attributes?.hp || 0),
          max: Number(monster.attributes?.hp || 0),
          temp: 0,
          details: ""
        },

        allSaves: { value: "" },

        speed: {
          value: Number(monster.attributes.speed || 25),

          otherSpeeds:
            (monster.attributes.otherSpeeds || []).map(s => ({
              type: slugify(s.type),
              value: Number(s.value || 0)
            })),

          details: ""
        },

        resistances: buildResistances(monster.resistances || []),
        weaknesses: buildWeaknesses(monster.weaknesses || []),
        immunities: buildImmunities(monster.immunities || [])
      },

      saves: {
        fortitude: {
          value: parseSignedNumber(monster.saves?.fortitude),
          saveDetail: ""
        },
        reflex: {
          value: parseSignedNumber(monster.saves?.reflex),
          saveDetail: ""
        },
        will: {
          value: parseSignedNumber(monster.saves?.will),
          saveDetail: ""
        }
      },

      skills: buildSkills(monster.skills || []),

      resources: {},
      _migration: { version: 0.959, previous: null }
    },

    items: [
      ...(monster.strikes || []).map(buildStrikeItem),

      ...(monster.abilitiesList || []).map(buildAbilityItem),

      ...buildSpellcastingItems(monster.spellcasting || []),

      ...(monster.lore || []).map(buildLoreItem)
    ],

    effects: [],
    folder: null,
    ownership: { default: 0 },
    flags: {},
    _stats: {
      coreVersion: "14.361",
      systemId: "pf2e",
      systemVersion: "8.1.2",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "0000000000000000"
    }
  };

  return actor;
}
