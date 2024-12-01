/**
 * Get the URL search parameters as an object.
 * 
 * @param {String} url 
 * @returns {Object} - The URL search parameters as an object.
 */
function getUrlParams(url) {
  const params = {};
  const parser = new URL(url);
  const queryString = parser.search.slice(1);
  const queryArray = queryString.split('&');

  queryArray.forEach(param => {
      const [key, value] = param.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });

  return params;
}

const url = window.location.href;
const params = getUrlParams(url);
const settingId = params.id;

const selectors = {
  stateJson: '#state',
  emptyState: '.empty-state',

  titleInput: '#title-input',

  discardButton: '[aria-controls="discard"]',
  saveButton: '[aria-controls="save"]',

  formulasListWrapper: '.formulas',
  formulasList: '.formulas-list',
  formulaTemplate: '#formula-line-template',
  formula: '.formula-line',
  formulaTitle: '.formula-title',
  formulaEditButton: '[aria-controls="edit-formula"]',
  formulaRemoveButton: '[aria-controls="remove-formula"]',
}

const initialState = document.querySelector(selectors.stateJson).textContent;

const state = JSON.parse(initialState);

let currentSettings = state.settings.find((setting) => setting.id == settingId);

// deep clone the current setting object for the functionality to revert the changes
let savedSettings = { ...currentSettings };

// flag to check was something changed so that we can show the save/discard button
let isEditing = false;

const titleInput = document.querySelector(selectors.titleInput);
const discardButton = document.querySelector(selectors.discardButton);
const saveButton = document.querySelector(selectors.saveButton);
const formulasListElement = document.querySelector(selectors.formulasList);
const formulasListWrapper = document.querySelector(selectors.formulasListWrapper);

/**
* Toggles the empty state based on the state settings length.
*/
function toggleEmptyState() {
  const emptyStateElement = document.querySelector(selectors.emptyState);
  if (currentSettings.formulas.length === 0) {
      emptyStateElement.classList.remove('hidden');
      formulasListWrapper.classList.add('hidden');
  } else {
      emptyStateElement.classList.add('hidden');
      formulasListWrapper.classList.remove('hidden');
  }
}

/**
* Redirects to the formula edit page.
* 
* @param {Object} formula - from the formulas list of the current setting.
*/
function editFormulaHandler(formula) {
  window.location.href = `/formula.html?id=${formula.id}`;
}

/**
* Removes a formula from the state and the DOM.
* 
* @param {Object} formulaTemplateElement - DOM element.
*/
function removeFormulaHandler(formulaTemplateElement) {
  const formulaId = formulaTemplateElement.id;
  currentSettings.formulas = currentSettings.formulas.filter((formula) => formula.id != formulaId);
  formulaTemplateElement.remove();
  toggleEmptyState();
}

/**
* Renders a formula element and attaches event listeners.
* 
* @param {Object} formula - The formula object to render.
*/
function renderFormulaElement(formula) {
  const isFormulaElementExist = document.getElementById(formula.id);
  if (isFormulaElementExist) return;

  const formulaTemplateElement = document.querySelector(selectors.formulaTemplate);
  const formulaTemplateElementCopy = formulaTemplateElement.cloneNode(true);
  formulaTemplateElementCopy.id = formula.id;
  const formulaTitleElement = formulaTemplateElementCopy.querySelector(selectors.formulaTitle);
  formulaTitleElement.innerText = formula.title;
  formulaTitleElement.href = `/formula.html?id=${formula.id}`;

  const formulaEditButtonElement = formulaTemplateElementCopy.querySelector(selectors.formulaEditButton);
  formulaEditButtonElement.addEventListener('click', (e) => {
      editFormulaHandler(formula);
  });
  const formulaRemoveButtonElement = formulaTemplateElementCopy.querySelector(selectors.formulaRemoveButton);
  formulaRemoveButtonElement.addEventListener('click', (e) => {
      removeFormulaHandler(formulaTemplateElementCopy);
  });
  formulaTemplateElementCopy.classList.remove('hidden');
  formulasListElement.appendChild(formulaTemplateElementCopy);
}

/**
* It renders and updated related elments using data from the state.
*/
function renderPage() {
  toggleEmptyState();
  titleInput.value = currentSettings.title;
  currentSettings.formulas.forEach((formula) => {
      renderFormulaElement(formula);
  });
}

/**
* Toggles classes to show/hide page controls.
*/
function handleChanges() {
  if (isEditing) {
      discardButton.classList.remove('disabled');
      saveButton.classList.remove('disabled');
  } else {
      discardButton.classList.add('disabled');
      saveButton.classList.add('disabled');
  }
}

/**
* Title edit handler.
* 
* @param {String} title 
*/
function titleEditHandler(title) {
  if (!title) return;
  isEditing = true;
  currentSettings.title = title;
  handleChanges();
}

/**
* Discard changes handler.
*/
function discardChangesHandler() {
  isEditing = false;
  currentSettings = { ...savedSettings };
  handleChanges();
  renderPage();
}

/**
* Save changes handler.
*/
function saveChangesHandler() {
  isEditing = false;
  savedSettings = { ...currentSettings };
  handleChanges();
}

titleInput?.addEventListener('input', (event) => {
  titleEditHandler(event.target.value);
});

discardButton?.addEventListener('click', discardChangesHandler);
saveButton?.addEventListener('click', saveChangesHandler);

renderPage();