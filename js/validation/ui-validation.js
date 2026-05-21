export function renderWarnings(warnings) {

  clearWarningHighlights();

  warnings.forEach(w => {

    const field = document.getElementById(w.field);

    if (!field) return;

    field.classList.add(`warning-${w.severity}`);
    field.title = w.message;
  });

  renderWarningPanel(warnings);
}