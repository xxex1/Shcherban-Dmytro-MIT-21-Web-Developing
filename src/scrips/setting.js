const RESET_STATE = false;

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
    toggleButton: '[aria-controls="toggle"]',

    formulasListWrapper: '.formulas',
    formulasList: '.formulas-list',
    formulaTemplate: '#formula-line-template',
    formula: '.formula-line',
    formulaTitle: '.formula-title',
    formulaEditButton: '[aria-controls="edit-formula"]',
    formulaRemoveButton: '[aria-controls="remove-formula"]',
}

/**
 * Gets the state object from the local storage or the initial state from the DOM if the state is not found in the local storage.
 * 
 * It also saves the state to the local storage if the state is not found in the local storage.
 * 
 * @returns {Object} - The state object.
 */
function getState() {
    const existedState = localStorage.getItem('state');
    let state;
    if (existedState && !RESET_STATE) {
        // local storage saves the state as a string, so we need to parse it to get the actual object and we return parsed value - an object
        state = JSON.parse(existedState);
    } else {
        const initialState = document.querySelector(selectors.stateJson).textContent;
        // Initial state is a JSON string, so we need to parse it to get the actual object.
        state = JSON.parse(initialState);
    }

    localStorage.setItem('state', JSON.stringify(state));
    return state;
}

const state = getState();

/**
 * Updates the state in the local storage.
 */
function updateState() {
    localStorage.setItem('state', JSON.stringify(state));
}

/**
 * Gets the current setting object from the state.
 * 
 * If the setting is not found in the state, it creates a new setting object and adds it to the state.
 * 
 * @returns {Object} - The current setting object.
 */
function getCurrentSetting() {
    const settingTemplate = {
        id: Date.now(),
        title: 'Setting title',
        status: 'draft',
        formulas: [],
    }

    // if no setting found, create a new setting object
    let setting = state.settings.find((setting) => setting.id == settingId);

    if (!setting) {
        setting = { ...settingTemplate };
        state.settings.push(setting);
        updateState();
    }
    return setting;
}

let currentSettings = getCurrentSetting();

// deep clone the current setting object for the functionality to revert the changes
let savedSettings = { ...currentSettings };

// flag to check was something changed so that we can show the save/discard button
let isEditing = false;

const titleInput = document.querySelector(selectors.titleInput);
const discardButton = document.querySelector(selectors.discardButton);
const saveButton = document.querySelector(selectors.saveButton);
const toggleButton = document.querySelector(selectors.toggleButton);
const formulasListElement = document.querySelector(selectors.formulasList);
const formulasListWrapper = document.querySelector(selectors.formulasListWrapper);

/**
 * Toggles the empty state based on the state settings length.
 */
function toggleEmptyState() {
    const emptyStateElement = document.querySelector(selectors.emptyState);
    if (currentSettings?.formulas.length === 0) {
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
    window.location.href = `/formula.html?id=${formula.id}&settingId=${currentSettings.id}`;
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
    updateState();
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
    formulaTitleElement.href = `/formula.html?id=${formula.id}&settingId=${currentSettings.id}`;

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
    titleInput.value = currentSettings?.title;
    toggleButton.dataset.status = currentSettings?.status;
    currentSettings?.formulas.forEach((formula) => {
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
 * Toggle setting status handler.
 */
function toggleSettingHandler() {
    const settingStatus = currentSettings.status === 'active' ? 'draft' : 'active';
    currentSettings.status = settingStatus;
    toggleButton.dataset.status = settingStatus;
    updateState();
}

/**
 * Save changes handler.
 */
function saveChangesHandler() {
    isEditing = false;
    savedSettings = { ...currentSettings };
    handleChanges();
    updateState();
}

titleInput?.addEventListener('input', (event) => {
    titleEditHandler(event.target.value);
});

discardButton?.addEventListener('click', discardChangesHandler);
saveButton?.addEventListener('click', saveChangesHandler);
toggleButton?.addEventListener('click', toggleSettingHandler);

renderPage();