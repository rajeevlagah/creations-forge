import { Monster } from "./model/monster.js";
import { buildFoundryActor } from "./model/foundry-export.js";
import {
  ALL_TRAITS,
  getTraitsByCategory
} from "./data/traits.js";

const state = {
  monster: new Monster(),

  selectedTraits: [],
  selectedLanguages: []
};

const PF2_SKILLS = [
  "Acrobatics",
  "Arcana",
  "Athletics",
  "Crafting",
  "Deception",
  "Diplomacy",
  "Intimidation",
  "Medicine",
  "Nature",
  "Occultism",
  "Performance",
  "Religion",
  "Society",
  "Stealth",
  "Survival",
  "Thievery"
];

const PF2_LANGUAGES = [

  // Common Languages
  "Common",
  "Draconic",
  "Dwarven",
  "Elven",
  "Fey",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Iblydosi",
  "Jotun",
  "Orcish",
  "Razatlani",
  "Sakvroth",
  "Taldane",
  "Tanuki",
  "Wayang",
  "Yaksha",
  "Ysoki",

  // Uncommon Languages
  "Adlet",
  "Aishmayar",
  "Aklo",
  "Alghollthu",
  "Amurrun",
  "Anadi",
  "Anugobu",
  "Arboreal",
  "Azlanti",
  "Boggard",
  "Calda",
  "Caligni",
  "Chthonian",
  "Cyclops",
  "Daemonic",
  "Destrachan",
  "Diabolic",
  "D'ziriak",
  "Ekujae",
  "Empyrean",
  "Erutaki",
  "Garundi",
  "Girtablilu",
  "Hallit",
  "Iruxi",
  "Jistkan",
  "Jyoti",
  "Kelish",
  "Khattibi",
  "Kholo",
  "Kibwani",
  "Kitsune",
  "Lirgeni",
  "Minkaian",
  "Muan",
  "Mwangi",
  "Mzunu",
  "Nagaji",
  "Necril",
  "Ninshaburian",
  "Ocotan",
  "Old Keleshite",
  "Osiriani",
  "Petran",
  "Protean",
  "Pyric",
  "Requian",
  "Shadowtongue",
  "Shoanti",
  "Shoony",
  "Skald",
  "Sphinx",
  "Strix",
  "Sussuran",
  "Talican",
  "Tengu",
  "Thalassic",
  "Thassilonian",
  "Thokol",
  "Tidespeech",
  "Tien",
  "Tripkee",
  "Utopian",
  "Varisian",
  "Varki",
  "Vudrani",
  "Xanmba",

  // Rare Languages
  "Akitonian",
  "Ancient Osiriani",
  "Androffan",
  "Arcadian",
  "Drooni",
  "Elder Thing",
  "Formian",
  "Goloma",
  "Grioth",
  "Hwan",
  "Ikeshti",
  "Jistka",
  "Kashrishi",
  "Kovintal",
  "Lashunta",
  "Mi-Go",
  "Minatan",
  "Munavri",
  "Okaiyan",
  "Orvian",
  "Rasu",
  "Ratajin",
  "Samsaran",
  "Sasquatch",
  "Senzar",
  "Shae",
  "Shisk",
  "Shobhad",
  "Surki",
  "Vanara",
  "Vishkanyan",
  "Wyrwood",
  "Yithian",

  // Secret Languages
  "Wildsong"

];

function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function saveState() {

  const monster =
    collectMonsterData();

  localStorage.setItem(
    "pf2-monster-builder",
    JSON.stringify(monster)
  );
}

function loadState() {
  const saved = localStorage.getItem("pf2-monster-builder");
  if (!saved) return;

  try {
    const raw = JSON.parse(saved);
    const monster = new Monster();

    // copy fields into a real Monster instance
    Object.assign(monster, raw);

    applyMonsterData(monster);
    state.monster = monster;

  } catch (err) {
    console.error("Failed to load save data", err);
  }
}

function applyMonsterData(monster) {

  if (!monster) return;

  Object.entries(monster).forEach(([key, value]) => {
    const field = document.getElementById(key);
    if (field && typeof value !== "object") {
      field.value = value ?? "";
    }
  });

  // ✅ Fix skills
  (monster.skills || []).forEach(skill => {
    const input = [...document.querySelectorAll(".skill-input")]
      .find(el => el.dataset.skill === skill.name);

    if (input) {
      input.value = skill.bonus;
    }
  });

  state.selectedTraits = monster.traits || [];
  renderTraitList();

  state.selectedLanguages = monster.languages || [];
  renderLanguageList();

  refreshPreview();
}


function parseSignedNumber(value) {

  if (!value) return 0;

  return Number(
    String(value)
      .replace(/\+/g, "")
      .trim()
  ) || 0;
}

function init() {

  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  document.getElementById("clear-monster").addEventListener("click", clearMonster);

  setupSelectors();
  renderSkills();
  setupListeners();
  populateTraitSelector();

  loadState();

  renderTraitList();
  renderLanguageList();

  refreshPreview();
}

function clearMonster() {

  const confirmed = confirm(
    "Are you sure you want to clear the entire monster?"
  );
  if (!confirmed) return;

  document
    .querySelectorAll("input, textarea, select")
    .forEach(el => {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
      } else {
        el.value = "";
      }
    });

  ["ability-list", "strike-list", "spellcasting-list", "interaction-list"]
    .forEach(id => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = "";
    });

  const monsterTraits = document.getElementById("monster-traits-tags");
  if (monsterTraits) monsterTraits.innerHTML = "";

  const languages = document.getElementById("languages-tags");
  if (languages) languages.innerHTML = "";

  const traitSection = document.getElementById("monster-traits-section");
  if (traitSection) traitSection.dataset.traits = "[]";

  // ✅ reset state, not a global
  state.selectedTraits = [];
  state.selectedLanguages = [];

  const languageSelect = document.getElementById("languages-select");
  if (languageSelect) languageSelect.value = "";

  // ✅ correct function name
  renderLanguageList();
  renderTraitList();

  refreshPreview();
  saveState();
}

function setupSelectors() {
  const traitSelect = document.getElementById("traits-select");
  const languageSelect = document.getElementById("languages-select");

  PF2_LANGUAGES
  .slice()
  .sort((a, b) => {

    if (a === "Common") return -1;
    if (b === "Common") return 1;

    return a.localeCompare(b);
  })
  .forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    languageSelect.appendChild(opt);
  });
}

function renderSkills() {
  const grid = document.getElementById("skills-grid");

  grid.innerHTML = "";

  PF2_SKILLS.forEach(skill => {
    const label = document.createElement("div");
    label.textContent = skill;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "skill-input";
    input.dataset.skill = skill;
    input.value = 0;

    grid.appendChild(label);
    grid.appendChild(input);
  });
}

function setupListeners() {
  document.getElementById("btn-create-monster")?.addEventListener("click", () => {
    document.querySelector(".landing-screen").classList.add("hidden");
    document.getElementById("editor-screen").classList.remove("hidden");

    refreshPreview();
  });

  document.getElementById("traits-select")?.addEventListener("change", addTrait);

  document.getElementById("languages-select")?.addEventListener("change", addLanguage);

  document.getElementById("btn-add-strike")?.addEventListener("click", addStrikeRow);

  document.getElementById("btn-add-ability")?.addEventListener("click", addAbilityRow);

  document.getElementById("btn-add-speed")?.addEventListener("click", () => addSpeedRow());

  document.getElementById("btn-add-lore")?.addEventListener("click", () => addLoreRow());



  document
  .getElementById("btn-add-spellcasting")
  .addEventListener("click", addSpellcastingEntry);

  document.getElementById("btn-add-sense")?.addEventListener("click", addSenseRow);

  document.getElementById("btn-refresh-preview")?.addEventListener("click", refreshPreview);

  document.getElementById("dark-mode-toggle")
    ?.addEventListener("click", () => {

      document.body.classList.toggle("dark-mode");

      localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-mode")
          ? "dark"
          : "light"
      );
    });

  document.getElementById("btn-add-resistance")?.addEventListener("click", addResistanceRow);

  document.getElementById("btn-add-weakness")?.addEventListener("click", addWeaknessRow);

  document.getElementById("btn-add-immunity")?.addEventListener("click", addImmunityRow);

  document.getElementById("btn-export-json")?.addEventListener("click", exportJSON);

  document.addEventListener("input", () => {

    refreshPreview();
    saveState();

  });

  document.addEventListener("change", () => {

    refreshPreview();
    saveState();

  });
}

function addTrait(event) {

  const value = event.target.value;

  if (!value) return;

  if (!state.selectedTraits.includes(value)) {

    state.selectedTraits.push(value);

    saveState();

    renderTraitList();

    refreshPreview();
  }

  event.target.value = "";
}

function populateTraitSelector() {

  const select =
    document.getElementById("traits-select");

  select.innerHTML =
    `<option value="">Select Trait...</option>`;

  const creatureTraits =
    getTraitsByCategory("creature");

  creatureTraits.forEach(trait => {

    const option =
      document.createElement("option");

    option.value = trait.slug;
    option.textContent = trait.label;

    select.appendChild(option);
  });
}

function renderTraitList() {

  const container =
    document.getElementById("trait-list");

  container.innerHTML = "";

  state.selectedTraits.forEach(trait => {

    const tag =
      document.createElement("div");

    tag.className = "tag-item";

    tag.innerHTML = `
      ${trait}
      <button
        class="tag-remove"
        data-trait="${trait}"
      >
        ×
      </button>
    `;

    tag.querySelector(".tag-remove")
      .addEventListener("click", () => {

        state.selectedTraits =
          state.selectedTraits
            .filter(t => t !== trait);

        saveState();

        renderTraitList();

        refreshPreview();
      });

    container.appendChild(tag);
  });
}

function addSpellcastingEntry() {

  const container = document.getElementById("spellcasting-list");

  const entry = document.createElement("div");
  entry.className = "spellcasting-entry";

  entry.innerHTML = `

    <div class="spellcasting-meta">

      <div class="field-group">
        <label>Type</label>

        <select class="spellcasting-type">
          <option value="prepared">Prepared</option>
          <option value="spontaneous">Spontaneous</option>
          <option value="innate">Innate</option>
          <option value="focus">Focus</option>
        </select>
      </div>

      <div class="field-group">
        <label>Tradition</label>

        <select class="spellcasting-tradition">
          <option value="arcane">Arcane</option>
          <option value="divine">Divine</option>
          <option value="occult">Occult</option>
          <option value="primal">Primal</option>
        </select>
      </div>

      <div class="field-group">
        <label>DC</label>
        <input type="text" class="spellcasting-dc">
      </div>

      <div class="field-group">
        <label>Attack</label>
        <input type="text" class="spellcasting-attack">
      </div>

    </div>

    <div class="spell-groups">

      <div class="spell-group">

        <input
          type="text"
          class="spell-group-label"
          value="1st"
        >

        <textarea
          class="spell-group-spells"
          placeholder="force barrage, mystic armor"
        ></textarea>

      </div>

    </div>

    <button class="btn-add-spell-group">
      Add Rank / Frequency
    </button>

    <hr>

  `;

  container.appendChild(entry);

  setupSpellGroupButtons(entry);
}

function setupSpellGroupButtons(entry) {

  const button = entry.querySelector(".btn-add-spell-group");

  button.addEventListener("click", () => {

    const groups = entry.querySelector(".spell-groups");

    const div = document.createElement("div");

    div.className = "spell-group";

    div.innerHTML = `

      <input
        type="text"
        class="spell-group-label"
        placeholder="3rd Rank / At Will / 3/day"
      >

      <textarea
        class="spell-group-spells"
        placeholder="fireball, haste"
      ></textarea>

    `;

    groups.appendChild(div);

  });

}

function addLanguage() {
  const select = document.getElementById("languages-select");
  const value = select.value;

  if (!value) return;

  if (state.selectedLanguages.includes(value)) {
    select.value = "";
    return;
  }

  state.selectedLanguages.push(value);

  saveState();

  renderLanguageList();

  select.value = "";

  refreshPreview();
}

function renderLanguageList() {
  const container = document.getElementById("language-list");

  container.innerHTML = "";

  state.selectedLanguages.forEach(language => {
    const item = document.createElement("div");
    item.className = "tag-item";

    item.innerHTML = `
      <span>${language}</span>
      <button class="tag-remove">×</button>
    `;

    item.querySelector("button").addEventListener("click", () => {
      state.selectedLanguages =
        state.selectedLanguages.filter(l => l !== language);

      saveState();

      renderLanguageList();

      refreshPreview();
    });

    container.appendChild(item);
  });
}

function addSenseRow() {
  const row = document.createElement("div");
  row.className = "simple-row";

  row.innerHTML = `
    <input class="sense-input" type="text" placeholder="darkvision">
    <button class="remove-btn">X</button>
  `;

  row.querySelector("button").addEventListener("click", () => row.remove());

  document.getElementById("sense-list").appendChild(row);
}

function addStrikeRow() {
  const row = document.createElement("div");
  row.className = "strike-row";

  row.innerHTML = `
    <input class="strike-name" type="text" placeholder="Jaws">
    <input class="strike-bonus" type="text" placeholder="+14">
    <div class="strike-traits-section">

      <select class="strike-trait-select">
        <option value="">
          Select Trait.
        </option>
      </select>

      <div class="strike-trait-tags"></div>

    </div>
    <input class="strike-damage" type="text" placeholder="2d8+6 piercing">
    <button>X</button>
  `;

  row.querySelector("button").addEventListener("click", () => row.remove());

  document.getElementById("strike-list").appendChild(row);

  setupStrikeTraitSelector(row);
}

function addLoreRow(name = "", bonus = "") {
  const row = document.createElement("div");
  row.className = "simple-row";

  row.innerHTML = `
    <input class="lore-name" type="text" placeholder="Warfare Lore" value="${name}">
    <input class="lore-bonus" type="text" placeholder="+10" value="${bonus}">
    <button class="remove-btn">X</button>
  `;

  row.querySelector("button").addEventListener("click", () => row.remove());

  document.getElementById("lore-list").appendChild(row);
}


function addSpeedRow(type = "", value = "") {
  const row = document.createElement("div");
  row.className = "simple-row";

  row.innerHTML = `
    <input class="speed-type" type="text" placeholder="fly / swim / burrow / climb" value="${type}">
    <input class="speed-value" type="text" placeholder="40" value="${value}">
    <button class="remove-btn">X</button>
  `;

  row.querySelector("button").addEventListener("click", () => row.remove());

  document.getElementById("other-speeds-list").appendChild(row);
}


function setupStrikeTraitSelector(row) {

  const select =
    row.querySelector(".strike-trait-select");

  const tags =
    row.querySelector(".strike-trait-tags");

  const selectedTraits = [];

  const allowedCategories = [
    "weapon",
    "damage",
    "action",
    "magic",
    "sanctification"
  ];

  const strikeTraits =
    ALL_TRAITS
      .filter(trait =>
        allowedCategories.includes(trait.category)
      )
      .sort((a, b) =>
        a.label.localeCompare(b.label)
      );

  strikeTraits.forEach(trait => {

    const option =
      document.createElement("option");

    option.value = trait.slug;
    option.textContent = trait.label;

    select.appendChild(option);

  });

  select.addEventListener("change", () => {

    const value = select.value;

    if (!value) return;

    if (selectedTraits.includes(value)) {
      select.value = "";
      return;
    }

    selectedTraits.push(value);

    renderTags();

    select.value = "";

    refreshPreview();

  });

  function renderTags() {

    tags.innerHTML = "";

    selectedTraits
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach(trait => {

        const tag =
          document.createElement("div");

        tag.className = "tag-item";

        tag.innerHTML = `
          <span>
            ${displayTrait(trait)}
          </span>

          <button
            class="tag-remove"
            type="button"
          >
            ×
          </button>
        `;

        tag.querySelector("button")
          .addEventListener("click", () => {

            const index =
              selectedTraits.indexOf(trait);

            if (index !== -1) {
              selectedTraits.splice(index, 1);
            }

            renderTags();

            refreshPreview();

          });

        tags.appendChild(tag);

      });

    row.dataset.traits =
      JSON.stringify(selectedTraits);

  }

  renderTags();
}

function addAbilityRow() {
  const row = document.createElement("div");

  row.className = "ability-card";

  row.innerHTML = `
    <div class="ability-top-row">

      <input
        class="ability-name"
        type="text"
        placeholder="Ability Name"
      >

      <select class="ability-type">
        <option value="passive">Passive</option>
        <option value="action">Action</option>
        <option value="reaction">Reaction</option>
        <option value="free">Free Action</option>
      </select>

    <select class="ability-category">
      <option value="offensive">Offensive</option>
      <option value="defensive">Defensive</option>
      <option value="interaction">Interaction</option>
      <option value="misc">Misc</option>
    </select>


      <select class="ability-cost">
        <option value="">—</option>
        <option value="1">◆</option>
        <option value="2">◆◆</option>
        <option value="3">◆◆◆</option>
        <option value="r">↺</option>
        <option value="f">◇</option>
      </select>

      <button class="delete-btn">X</button>

    </div>

    <div class="ability-traits-section">

      <select class="ability-trait-select">
        <option value="">
          Select Trait...
        </option>
      </select>

      <div class="ability-trait-tags"></div>

    </div>

    <textarea
      class="ability-description"
      rows="3"
      placeholder="Ability description..."
    ></textarea>
  `;

  row.querySelector(".delete-btn")
    .addEventListener("click", () => row.remove());

  document.getElementById("ability-list")
    .appendChild(row);

  setupAbilityTraitSelector(row);
}

function setupAbilityTraitSelector(row) {

  const select =
    row.querySelector(".ability-trait-select");

  const tags =
    row.querySelector(".ability-trait-tags");

  const selectedTraits = [];

  const allowedCategories = [
    "general",
    "action",
    "damage",
    "magic",
    "sanctification"
  ];

  const abilityTraits =
    ALL_TRAITS
      .filter(trait =>
        allowedCategories.includes(trait.category)
      )
      .sort((a, b) =>
        a.label.localeCompare(b.label)
      );

  abilityTraits.forEach(trait => {

    const option =
      document.createElement("option");

    option.value = trait.slug;
    option.textContent = trait.label;

    select.appendChild(option);

  });

  select.addEventListener("change", () => {

    const value = select.value;

    if (!value) return;

    if (selectedTraits.includes(value)) {
      select.value = "";
      return;
    }

    selectedTraits.push(value);

    renderTags();

    select.value = "";

    refreshPreview();

  });

  function renderTags() {

    tags.innerHTML = "";

    selectedTraits
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach(trait => {

        const div =
          document.createElement("div");

        div.className = "tag-item ability-trait-tag";

        div.dataset.trait = trait;

        div.innerHTML = `
          ${displayTrait(trait)}

          <button type="button">
            ×
          </button>
        `;

        div.querySelector("button")
          .addEventListener("click", () => {

            const index =
              selectedTraits.indexOf(trait);

            if (index !== -1) {
              selectedTraits.splice(index, 1);
            }

            renderTags();

            refreshPreview();

          });

        tags.appendChild(div);

      });

  }

}

function addResistanceRow() {
  addDefenseRow("resistance-list", "resistance-row", true);
}

function addWeaknessRow() {
  addDefenseRow("weakness-list", "weakness-row", false);
}

function addImmunityRow() {
  const row = document.createElement("div");

  row.className = "simple-row";

  row.innerHTML = `
    <input class="immunity-type" type="text" placeholder="poison">
    <button>X</button>
  `;

  row.querySelector("button")
    .addEventListener("click", () => row.remove());

  document.getElementById("immunity-list")
    .appendChild(row);
}

function addDefenseRow(
  containerId,
  className,
  includeDoubleVs = false
) {
  const row = document.createElement("div");

  row.className = `defense-tag-row ${className}`;

  row.innerHTML = `
    <input
      class="defense-type"
      type="text"
      placeholder="fire"
    >

    <input
      class="defense-value"
      type="text"
      placeholder="10"
    >

    <input
      class="defense-note"
      type="text"
      placeholder="Exceptions (comma-separated)"
    >

    ${
      includeDoubleVs
        ? `
          <input
            class="defense-double-vs"
            type="text"
            placeholder="Double vs. (comma-separated)"
          >
        `
        : ""
    }

    <button>X</button>
  `;

  row.querySelector("button")
    .addEventListener("click", () => row.remove());

  document.getElementById(containerId)
    .appendChild(row);
}

function collectMonsterData() {
  const m = new Monster();

  // Core identity
  m.name = document.getElementById("mon-name").value;
  m.level = Number(document.getElementById("mon-level").value) || 0;
  m.size = document.getElementById("mon-size").value || "med";
  m.rarity = document.getElementById("mon-rarity").value || "common";

  // Traits & languages
  m.traits = [...state.selectedTraits];
  m.languages = [...state.selectedLanguages];

  // Ability scores
  m.abilities = {
    str: parseSignedNumber(document.getElementById("mod-str").value),
    dex: parseSignedNumber(document.getElementById("mod-dex").value),
    con: parseSignedNumber(document.getElementById("mod-con").value),
    int: parseSignedNumber(document.getElementById("mod-int").value),
    wis: parseSignedNumber(document.getElementById("mod-wis").value),
    cha: parseSignedNumber(document.getElementById("mod-cha").value),
  };

  // Defenses & perception
  m.attributes.ac = parseSignedNumber(document.getElementById("mon-ac").value);
  m.attributes.hp = parseSignedNumber(document.getElementById("mon-hp").value);
  m.attributes.perception = parseSignedNumber(document.getElementById("mon-perception").value);

  // Speed (string like "25 feet, fly 40 feet")
  m.attributes.speed = document.getElementById("speed-base").value || "25";

  m.attributes.otherSpeeds = [...document.querySelectorAll(".speed-type")].map((el, i) => {
    const type = el.value.trim();
    const value = document.querySelectorAll(".speed-value")[i].value.trim();

    if (!type || !value) return null;

    return { type, value: Number(value) };
  }).filter(Boolean);


  // Saves
  m.saves.fortitude = parseSignedNumber(document.getElementById("save-fort").value);
  m.saves.reflex = parseSignedNumber(document.getElementById("save-ref").value);
  m.saves.will = parseSignedNumber(document.getElementById("save-will").value);

  // Skills
  m.skills = [...document.querySelectorAll(".skill-input")]
    .map(input => ({
      name: input.dataset.skill,
      bonus: parseSignedNumber(input.value)
    }))
    .filter(skill => skill.bonus !== 0);

  m.lore = [...document.querySelectorAll(".lore-name")].map((el, i) => {
    const name = el.value.trim();
    const bonus = parseSignedNumber(document.querySelectorAll(".lore-bonus")[i].value);

    if (!name) return null;

    return { name, bonus };
  }).filter(Boolean);


  // Senses
  m.senses = [...document.querySelectorAll(".sense-input")]
    .map(input => input.value.trim())
    .filter(Boolean);

  // Strikes
  m.strikes = [...document.querySelectorAll(".strike-row")].map(row => ({
    name: row.querySelector(".strike-name").value.trim() || "Strike",
    bonus: parseSignedNumber(row.querySelector(".strike-bonus").value),
    damage: row.querySelector(".strike-damage").value.trim(),
    traits: JSON.parse(row.dataset.traits || "[]"),
  })).filter(s => s.name || s.damage);

  // Action abilities (offensive/defensive/etc.)
  m.abilitiesList =
    [...document.querySelectorAll(".ability-card")]
      .map(card => ({
        name: card.querySelector(".ability-name").value.trim(),
        type: card.querySelector(".ability-type").value,   // "passive" | "action" | "reaction" | "free"
        cost: card.querySelector(".ability-cost").value,   // "1" | "2" | "3" | "r" | "f" | ""
        traits: [...card.querySelectorAll(".ability-trait-tag")].map(tag => tag.dataset.trait),
        category: card.querySelector(".ability-category")?.value || "offensive",
        description: card.querySelector(".ability-description").value.trim()
      }))
      .filter(a => a.name);

  // Spellcasting
  m.spellcasting =
    [...document.querySelectorAll(".spellcasting-entry")]
      .map(entry => {
        const groups =
          [...entry.querySelectorAll(".spell-group")]
            .map(group => ({
              label: group.querySelector(".spell-group-label").value.trim(),
              spells: group.querySelector(".spell-group-spells").value.trim()
            }))
            .filter(g => g.label && g.spells);

        return {
          type: entry.querySelector(".spellcasting-type").value,          // prepared | spontaneous | innate | focus
          tradition: entry.querySelector(".spellcasting-tradition").value, // arcane | divine | occult | primal
          dc: parseSignedNumber(entry.querySelector(".spellcasting-dc").value),
          attack: parseSignedNumber(entry.querySelector(".spellcasting-attack").value),
          groups
        };
      })
      .filter(s => s.groups && s.groups.length);

  // Resistances / weaknesses / immunities
    m.resistances =
    [...document.querySelectorAll(".resistance-row")]
      .map(row => ({
        type: row.querySelector(".defense-type").value.trim(),

        value: parseSignedNumber(
          row.querySelector(".defense-value").value
        ),

        note:
          row.querySelector(".defense-note")
            ?.value
            .split(",")
            .map(v => v.trim())
            .filter(Boolean) || [],

        doubleVs:
          row.querySelector(".defense-double-vs")
            ?.value
            .split(",")
            .map(v => v.trim())
            .filter(Boolean) || []
      }))
      .filter(r => r.type);

  m.weaknesses =
    [...document.querySelectorAll(".weakness-row")]
      .map(row => ({
        type: row.querySelector(".defense-type").value.trim(),
        value: parseSignedNumber(row.querySelector(".defense-value").value),
        note:
          row.querySelector(".defense-note")
            ?.value
            .split(",")
            .map(v => v.trim())
            .filter(Boolean) || []
              }))
              .filter(w => w.type);

  m.immunities =
    [...document.querySelectorAll(".immunity-type")]
      .map(input => input.value.trim())
      .filter(Boolean);

  state.monster = m;
  return m;
}


function renderAbilityPreview(ability) {

  const ICONS = {
  "1": "icons/actions/one-action.webp",
  "2": "icons/actions/two-actions.webp",
  "3": "icons/actions/three-actions.webp",
  "r": "icons/actions/reaction.webp",
  "f": "icons/actions/free-action.webp"
  };

  const icon =
    ability.cost && ICONS[ability.cost]
      ? `
          <img
            class="ability-action-icon"
            src="${ICONS[ability.cost]}"
            alt=""
          >
        `
      : "";

  return `
    <div class="preview-ability">

      <strong>${ability.name}</strong>

      ${icon}

      ${
        ability.traits.length
          ? `
            <span class="preview-traits-inline">

              (${ability.traits
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map(displayTrait)
                .join(", ")})

            </span>
          `
          : ""
      }

      ${
        ability.description
          ? ` ${ability.description}`
          : ""
      }

    </div>
  `;
}

function renderSpellcastingPreview(entry) {

  const dc =
    parseSignedNumber(entry.dc);

  const attack =
    parseSignedNumber(entry.attack);

  const tradition =
    capitalize(entry.tradition);

  const type =
    capitalize(entry.type);

  const title =
  `${tradition} ${type} Spells`;

  let details = "";

  if (dc) {
    details += ` DC ${dc}`;
  }

  if (attack) {
    details += `, attack ${
      attack >= 0 ? "+" : ""
    }${attack}`;
  }

  const rankLines =
    (entry.groups || [])
      .map(group => {

        const label =
          group.label?.trim();

        const spells =
          group.spells?.trim();

        if (!label || !spells) {
          return "";
        }

        return `<strong>${label}</strong> ${spells}`; 

      })
      .filter(Boolean)
      .join("; ");

  return `
    <div class="preview-spellcasting">
      <strong>${title}</strong>${details}${rankLines ? `; ${rankLines}` : ""}
    </div>
  `;
}

function displaySize(size) {

  const sizes = {
    tiny: "Tiny",
    sm: "Small",
    med: "Medium",
    lg: "Large",
    huge: "Huge",
    grg: "Gargantuan"
  };

  return sizes[size] || size;
}

function displayTrait(slug) {

  return slug
    .split("-")
    .map(word =>
      word.charAt(0).toUpperCase()
      + word.slice(1)
    )
    .join(" ");
}

function capitalize(text) {

  if (!text) return "";

  return text.charAt(0).toUpperCase()
    + text.slice(1);
}

function refreshPreview() {
  collectMonsterData();

  const m = state.monster;

  // Combine skills + lore into one unified list
  const allSkills = [
    ...(m.skills || []).map(s => ({
      label: s.name,
      bonus: s.bonus
    })),
    ...(m.lore || []).map(l => ({
      label: `Lore (${l.name})`,
      bonus: l.bonus
    }))
  ];

  // Sort alphabetically
  allSkills.sort((a, b) => a.label.localeCompare(b.label));

  // Convert to preview text
  const skillsText = allSkills
    .map(s => `${s.label} ${s.bonus >= 0 ? "+" : ""}${s.bonus}`)
    .join(", ");

  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  m.traits = ensureArray(m.traits);
  m.languages = ensureArray(m.languages);
  m.senses = ensureArray(m.senses);
  m.strikes = ensureArray(m.strikes);
  m.abilitiesList = ensureArray(m.abilitiesList);
  m.spellcasting = ensureArray(m.spellcasting);
  m.resistances = ensureArray(m.resistances);
  m.weaknesses = ensureArray(m.weaknesses);
  m.immunities = ensureArray(m.immunities);


  document.getElementById("preview-panel").innerHTML = `

    <div class="preview-header">

      <div class="preview-title-row">

        <h2>${m.name || "Unnamed Creature"}</h2>

        <span class="preview-level">
          CREATURE ${m.level ?? 0}
        </span>

      </div>

      <div class="preview-traits">

        ${
          [
            m.rarity !== "common"
              ? m.rarity
              : null,

            m.size,

            ...(m.traits || [])
              .slice()
              .sort((a, b) =>
                displayTrait(a)
                  .localeCompare(displayTrait(b))
              )
          ]
          .filter(Boolean)
          .map(trait => {

            let extraClass = "";

            if (
              ["tiny", "sm", "med", "lg", "huge", "grg"]
                .includes(trait)
            ) {
              extraClass = "size-trait";
            }

            if (
              ["common", "uncommon", "rare", "unique"]
                .includes(trait)
            ) {
              extraClass = `rarity-${trait}`;
            }

            return `
              <span class="trait ${extraClass}">
                ${
                  ["tiny", "sm", "med", "lg", "huge", "grg"]
                    .includes(trait)
                    ? displaySize(trait).toUpperCase()
                    : displayTrait(trait).toUpperCase()
                }
              </span>
            `;
          })
          .join("")
        }

      </div>

    </div>

    <div class="preview-section">

      <p class="preview-line">

        <strong>Perception</strong>

        ${m.attributes.perception >= 0 ? "+" : ""}${m.attributes.perception}

        ${
          m.senses?.length
            ? `; ${m.senses.join(", ")}`
            : ""
        }

      </p>

      <p>

        <strong>Languages</strong>

        ${
          (m.languages || []).length

            ? [
                ...(m.languages.includes("Common")
                  ? ["Common"]
                  : []),

                ...(m.languages
                  .filter(l => l !== "Common")
                  .slice()
                  .sort((a, b) =>
                    a.localeCompare(b)
                  ))
              ].join(", ")

            : "—"
        }

      </p>

      <p>
        <strong>Skills</strong>
        ${skillsText || "—"}
      </p>



      <p>
        <strong>Str</strong>
        ${m.abilities.str >= 0 ? "+" : ""}${m.abilities.str},

        <strong>Dex</strong>
        ${m.abilities.dex >= 0 ? "+" : ""}${m.abilities.dex},

        <strong>Con</strong>
        ${m.abilities.con >= 0 ? "+" : ""}${m.abilities.con},

        <strong>Int</strong>
        ${m.abilities.int >= 0 ? "+" : ""}${m.abilities.int},

        <strong>Wis</strong>
        ${m.abilities.wis >= 0 ? "+" : ""}${m.abilities.wis},

        <strong>Cha</strong>
        ${m.abilities.cha >= 0 ? "+" : ""}${m.abilities.cha}
      </p>

      <hr>

      <p>
        <strong>AC</strong> ${m.attributes.ac};
        <strong>Fort</strong>
        ${m.saves.fortitude >= 0 ? "+" : ""}${m.saves.fortitude},

        <strong>Ref</strong>
        ${m.saves.reflex >= 0 ? "+" : ""}${m.saves.reflex},

        <strong>Will</strong>
        ${m.saves.will >= 0 ? "+" : ""}${m.saves.will}
      </p>

      <p>
        <strong>HP</strong> ${m.attributes.hp}${
          (m.immunities || []).length
            ? `; <strong>Immunities</strong> ${m.immunities.join(", ")}`
            : ""
        }${
          (m.resistances || []).length
            ? `; <strong>Resistances</strong> ${
                m.resistances
                  .map(r => {

                    const note =
                      r.note?.length
                        ? ` (except ${r.note.join(", ")})`
                        : "";

                    const doubleVs =
                      r.doubleVs?.length
                        ? ` [double vs. ${r.doubleVs.join(", ")}]`
                        : "";

                    return `${r.type} ${r.value}${note}${doubleVs}`;
                  })
                  .join(", ")
              }`
            : ""
        }${
          (m.weaknesses || []).length
            ? `; <strong>Weaknesses</strong> ${
                m.weaknesses
                  .map(w =>
                    `${w.type} ${w.value}${
                      w.note?.length
                        ? ` (except ${w.note.join(", ")})`
                        : ""
                    }`
                  )
                  .join(", ")
              }`
            : ""
        }
      </p>

      ${(m.abilitiesList || [])
        .filter(a => a.type === "passive")
        .map(renderAbilityPreview)
        .join("")}

      ${(m.abilitiesList || [])
        .filter(a => a.type === "reaction")
        .map(renderAbilityPreview)
        .join("")}

      <hr>

      <p>
        <strong>Speed</strong>
        ${m.attributes.speed}
      </p>

      <div class="preview-section">

        ${(m.strikes || [])
          .map(s => {

            const bonus = parseSignedNumber(s.bonus);

            const sortedTraits =
              (s.traits || [])
                .slice()
                .sort((a, b) =>
                  displayTrait(a)
                    .localeCompare(displayTrait(b))
                );

            return `
              <div class="preview-strike">

                <strong>${s.name}</strong>

                ${bonus >= 0 ? "+" : ""}${bonus}

                ${
                  sortedTraits.length
                    ? ` <em>(${sortedTraits
                        .map(t => displayTrait(t).toLowerCase())
                        .join(", ")})</em>`
                    : ""
                }

                ${s.damage}

              </div>
            `;

          })
          .join("")}

      </div>

      ${(m.spellcasting || [])
        .map(renderSpellcastingPreview)
        .join("")}

      <div class="preview-section">

        ${(m.abilitiesList || [])
          .filter(a =>
            a.type === "action" ||
            a.type === "free"
          )
          .map(renderAbilityPreview)
          .join("")}

      </div>

    </div>
  `;
}

document.querySelectorAll(".resize-handle")
  .forEach(handle => {

    let startX;
    let startWidth;
    let previous;

    handle.addEventListener("mousedown", e => {

      previous = handle.previousElementSibling;

      startX = e.clientX;

      startWidth =
        previous.offsetWidth;

      function mouseMove(e) {

        const width =
          startWidth + (e.clientX - startX);

        previous.style.width =
          `${width}px`;
      }

      function mouseUp() {

        document.removeEventListener(
          "mousemove",
          mouseMove
        );

        document.removeEventListener(
          "mouseup",
          mouseUp
        );
      }

      document.addEventListener(
        "mousemove",
        mouseMove
      );

      document.addEventListener(
        "mouseup",
        mouseUp
      );

    });

  });

function exportJSON() {

  const monster = collectMonsterData();

  const foundryActor = buildFoundryActor(monster);

  const json = JSON.stringify(foundryActor, null, 2);

  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${monster.name || "creature"}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", init);

console.log("APP LOADED");