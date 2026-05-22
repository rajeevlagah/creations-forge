import { Monster } from "./model/monster.js";
import { buildFoundryActor } from "./model/foundry-export.js";
import {
  ALL_TRAITS,
  getTraitsByCategory
} from "./data/traits.js";

import { PF2_LANGUAGES } from "./data/languages.js";
import { validateMonster } from "./validation/warnings.js";

let warningsVisible = false;

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

    // copies fields into a real Monster instance
    Object.assign(monster, raw);

    applyMonsterData(monster);
    state.monster = monster;

  } catch (err) {
    console.error("Failed to load save data", err);
  }
}

async function importMonsterFile(event) {

  const file = event.target.files[0];

  if (!file) return;

  try {

    const text = await file.text();

    const raw = JSON.parse(text);

    console.log(raw);

    let monster;

    // IMPORTING APP JSON
    if (!raw.system) {

      monster = new Monster();

      Object.assign(monster, raw);

    }

    // IMPORTING FOUNDRY PF2E EXPORT
    else {

      monster = convertFoundryMonster(raw);

    }

    applyMonsterData(monster);

    document.querySelector(".landing-screen")?.classList.add("hidden");

    document.getElementById("editor-screen")?.classList.remove("hidden");

    state.monster = monster;

    refreshPreview();

    saveState();

    alert("Monster imported successfully!");

  } catch (err) {

    console.error(err);

    alert("Invalid or unsupported monster JSON.");
  }

  event.target.value = "";
}

function normalizeLanguage(lang) {

  return lang
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function convertFoundryMonster(raw) {

  const monster = new Monster();

  monster.name = raw.name || "";

  monster.level =
    raw.system?.details?.level?.value || 0;

  monster.size =
    raw.system?.traits?.size?.value || "med";

  monster.traits =
    raw.system?.traits?.value || [];

  const importedLanguages =
  raw.system?.details?.languages?.value || [];

  monster.languages =
    importedLanguages
      .map(normalizeLanguage)
      .filter(lang =>
        PF2_LANGUAGES.includes(lang)
      );

  monster.attributes.ac =
    raw.system?.attributes?.ac?.value || 0;

  monster.attributes.hp =
    raw.system?.attributes?.hp?.max || 0;

  monster.attributes.speed =
    raw.system?.attributes?.speed?.value || 25;

  monster.saves.fortitude =
    raw.system?.saves?.fortitude?.value || 0;

  monster.saves.reflex =
    raw.system?.saves?.reflex?.value || 0;

  monster.saves.will =
    raw.system?.saves?.will?.value || 0;

  monster.abilities.str =
    raw.system?.abilities?.str?.mod || 0;

  monster.abilities.dex =
    raw.system?.abilities?.dex?.mod || 0;

  monster.abilities.con =
    raw.system?.abilities?.con?.mod || 0;

  monster.abilities.int =
    raw.system?.abilities?.int?.mod || 0;

  monster.abilities.wis =
    raw.system?.abilities?.wis?.mod || 0;

  monster.abilities.cha =
    raw.system?.abilities?.cha?.mod || 0;

  monster.attributes.perception =
    raw.system?.perception?.mod || 0;

  monster.skills =
    Object.entries(raw.system?.skills || {})
      .map(([name, value]) => ({
        skill: name,
        bonus: value.base ?? 0
      }));

  monster.resistances =
    (raw.system?.attributes?.resistances || [])
      .map(r => ({
        type: r.type || "",
        value: r.value || 0
      }));

  monster.weaknesses =
    (raw.system?.attributes?.weaknesses || [])
      .map(w => ({
        type: w.type || "",
        value: w.value || 0
      }));

  monster.immunities =
    (raw.system?.attributes?.immunities || [])
      .map(i => i.type || "");

  monster.abilitiesList =
    (raw.items || [])
      .filter(item =>
        item.type === "action"
      )
      .map(item => ({
        name: item.name || "",
        description:
          item.system?.description?.value || "",
        actions:
          item.system?.actions?.value || 0
      }));

  return monster;
}

function validateImportedMonster(data) {

  if (!data || typeof data !== "object") {
    throw new Error("Invalid JSON structure");
  }

  if (!data.name) {
    throw new Error("Monster name missing");
  }

  if (!Array.isArray(data.traits)) {
    data.traits = [];
  }

  if (!Array.isArray(data.languages)) {
    data.languages = [];
  }

  if (!Array.isArray(data.skills)) {
    data.skills = [];
  }

  if (!Array.isArray(data.strikes)) {
    data.strikes = [];
  }

  if (!Array.isArray(data.abilitiesList)) {
    data.abilitiesList = [];
  }

  if (!Array.isArray(data.spellcasting)) {
    data.spellcasting = [];
  }
}

function setFieldValue(id, value) {

  const field =
    document.getElementById(id);

  if (!field) {
    console.warn(`Missing field: ${id}`);
    return;
  }

  field.value = value ?? "";
}

function applyMonsterData(monster) {

  if (!monster) return;

  setFieldValue("mon-name", monster.name);
  setFieldValue("mon-level", monster.level);
  setFieldValue("mon-rarity", monster.rarity);
  setFieldValue("mon-size", monster.size);

  setFieldValue("mod-str", monster.abilities?.str);
  setFieldValue("mod-dex", monster.abilities?.dex);
  setFieldValue("mod-con", monster.abilities?.con);
  setFieldValue("mod-int", monster.abilities?.int);
  setFieldValue("mod-wis", monster.abilities?.wis);
  setFieldValue("mod-cha", monster.abilities?.cha);

  setFieldValue("mon-ac", monster.attributes?.ac);
  setFieldValue("mon-hp", monster.attributes?.hp);
  setFieldValue("speed-base", monster.attributes?.speed);
  setFieldValue("mon-perception", monster.attributes?.perception);

  setFieldValue("save-fort", monster.saves?.fortitude);
  setFieldValue("save-ref", monster.saves?.reflex);
  setFieldValue("save-will", monster.saves?.will);

  // SKILLS
  (monster.skills || []).forEach(skill => {

    const input =
      [...document.querySelectorAll(".skill-input")]
        .find(el =>
          el.dataset.skill.toLowerCase()
            === skill.skill.toLowerCase()
        );

    if (input) {
      input.value = skill.bonus;
    }
  });

  // TRAITS
  state.selectedTraits =
    monster.traits || [];

  renderTraitList();

  // LANGUAGES
  state.selectedLanguages =
    monster.languages || [];

  renderLanguageList();

  // SENSES
  (monster.senses || []).forEach(sense => {

    addSenseRow();

    const rows =
      document.querySelectorAll(
        "#sense-list .simple-row"
      );

    const last =
      rows[rows.length - 1];

    last.querySelector(".sense-input").value =
      sense;
  });

  // STRIKES
  (monster.strikes || []).forEach(strike => {

    addStrikeRow();

    const rows =
      document.querySelectorAll(".strike-row");

    const row =
      rows[rows.length - 1];

    row.querySelector(".strike-name").value =
      strike.name || "";

    row.querySelector(".strike-bonus").value =
      strike.bonus || "";

    row.querySelector(".strike-damage").value =
      strike.damage || "";
  });

  (monster.resistances || []).forEach(r => {
    addResistanceRow(r.type, r.value);
  });

  (monster.weaknesses || []).forEach(w => {
    addWeaknessRow(w.type, w.value);
  });

  (monster.immunities || []).forEach(i => {
    addImmunityRow(i);
  });

  (monster.abilitiesList || []).forEach(a => {
    addAbilityRow();
    const rows =
      document.querySelectorAll(".ability-row");
    const row =
      rows[rows.length - 1];
    row.querySelector(".ability-name").value =
      a.name || "";
    row.querySelector(".ability-actions").value =
      a.actions || 0;
    row.querySelector(".ability-description").value =
      a.description || "";
  });

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

  state.selectedTraits = [];
  state.selectedLanguages = [];

  const languageSelect = document.getElementById("languages-select");
  if (languageSelect) languageSelect.value = "";

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

function clearWarningHighlights() {

  document
    .querySelectorAll(
      ".warning-extreme, .warning-high, .warning-moderate, .warning-low, .warning-terrible"
    )
    .forEach(el => {

      el.classList.remove(
        "warning-extreme",
        "warning-high",
        "warning-moderate",
        "warning-low",
        "warning-terrible"
      );

      el.removeAttribute("title");
    });

  const panel =
    document.getElementById("validation-panel");

  if (panel) {
    panel.innerHTML = "";
  }
}

function renderWarnings(warnings) {

  clearWarningHighlights();

  const panel =
    document.getElementById("validation-panel");

  panel.innerHTML = "";

  warnings.forEach(w => {

    // highlight field
    const field =
      document.getElementById(w.field);

    if (field) {

      field.classList.add(
        `warning-${w.severity}`
      );

      field.title = w.message;
    }

    // sidebar entry
    const row =
      document.createElement("div");

    row.className =
      `warning-${w.severity}`;

    row.style.padding = "6px";
    row.style.marginBottom = "4px";

    row.textContent =
      w.message;

    panel.appendChild(row);
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
      input.id =
        `skill-${skill.toLowerCase()}`;
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

  document.getElementById("btn-import-monster")?.addEventListener("click", () => {
    document.getElementById("import-file").click();

    refreshPreview();


    document.querySelector(".landing-screen").classList.add("hidden");
    document.getElementById("editor-screen").classList.remove("hidden");
  });

  document.getElementById("import-file")?.addEventListener("change", importMonsterFile);

  document.getElementById("traits-select")?.addEventListener("change", addTrait);

  document.getElementById("languages-select")?.addEventListener("change", addLanguage);

  document.getElementById("btn-add-strike")?.addEventListener("click", addStrikeRow);

  document.getElementById("btn-add-ability")?.addEventListener("click", addAbilityRow);

  document.getElementById("btn-add-speed")?.addEventListener("click", () => addSpeedRow());

  document.getElementById("btn-add-lore")?.addEventListener("click", () => addLoreRow());

  document
  .getElementById("btn-highlight-warnings")
  ?.addEventListener("click", () => {

    const button =
      document.getElementById(
        "btn-highlight-warnings"
      );

    // HIDE WARNINGS
    if (warningsVisible) {

      clearWarningHighlights();

      warningsVisible = false;

      button.textContent =
        "Highlight Warnings";

      return;
    }

    // SHOW WARNINGS
    const monster =
      collectMonsterData();

    const warnings =
      validateMonster(monster);

    renderWarnings(warnings);

    warningsVisible = true;

    button.textContent =
      "Hide Warnings";
  });

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

  const strikeIndex =
    document.querySelectorAll(".strike-row").length;

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

    <input
      id="strike-damage-${strikeIndex}"
      class="strike-damage"
      type="text"
      placeholder="2d8+6 piercing"
    >

    <button type="button">X</button>
  `;

  row.querySelector("button")
    .addEventListener("click", () => row.remove());

  document
    .getElementById("strike-list")
    .appendChild(row);

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

  // Combines skills + lore into one unified list
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

  // Sorts alphabetically
  allSkills.sort((a, b) => a.label.localeCompare(b.label));

  // Converts to preview text
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
        ${m.attributes.speed} feet
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