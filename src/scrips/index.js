// set to true if you want to reset the state to the initial state from the DOM.
const RESET_STATE = false;

// Selectors from index.html we use to interact with the DOM.
const selectors = {
    stateJson: '#state',
    emptyState: '.empty-state',
    settingsTable: '.settings-table',
    createSettingButton: '[aria-controls="create-setting"]',
    settingsList: '.settings-list',
    settingTemplate: '#setting-line-template',
    settingLine: '.setting-line',
    settingLink: '.setting-link',
    settingStatusBadge: '.setting-status-badge',
    settingRemoveButton: '[aria-controls="create-remove"]',
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
 * Removes the setting from the state and the DOM.
 * 
 * @param {Object} settingLineElement - The setting line element to remove.
 */
function removeSettingHandler(settingLineElement) {
    // Remove the setting from the DOM.
    settingLineElement.remove();
    // Remove the setting from the state.
    const settingIndexToRemove = state.settings.findIndex((setting) => setting.id === settingLineElement.id);
    state.settings.splice(settingIndexToRemove, 1);
    toggleEmptyState();
    updateState();
}

/**
 * Function initialization.
 * 
 * Creates line settings elements based on the state by copying the template element, change its content and append it to the settings list element.
 * 
 * @param {Object} setting - The setting object to render.
 */
function renderSettingElement(setting) {
    // 1. Find the setting template element.
    const settingTemplateElement = document.querySelector(selectors.settingTemplate);

    // 2. Deep clone the setting template element.
    const settingTemplateElementCopy = settingTemplateElement.cloneNode(true);

    // 3. Change the content of the clonned setting template element.
    settingTemplateElementCopy.id = setting.id; // Set the id of the setting element to the setting id.
    const settingLinkElement = settingTemplateElementCopy.querySelector(selectors.settingLink);
    const settingUrl = `/setting.html?id=${setting.id}`; // We will need the id parameter to get settings data from the state on the settings edit page.
    settingLinkElement.href = settingUrl; // Set the href attribute of the setting link element to the setting url.
    settingLinkElement.innerText = setting.title; // Set the inner text of the setting link element to the setting title.
    const settingStatusBadgeElement = settingTemplateElementCopy.querySelector(selectors.settingStatusBadge);
    settingStatusBadgeElement.innerText = setting.status; // Set the inner text of the setting status badge element to the setting status.
    // toggle the active class based on the setting status.
    if (setting.status === 'active') {
        settingStatusBadgeElement.classList.add('active');
    } else {
        settingStatusBadgeElement.classList.remove('active');
    }
    const settingRemoveButtonElement = settingTemplateElementCopy.querySelector(selectors.settingRemoveButton);
    // Add an event listener to the remove button element to remove the setting from the state and the DOM.
    settingRemoveButtonElement.addEventListener('click', () => {
        removeSettingHandler(settingTemplateElementCopy);
    });
    settingTemplateElementCopy.classList.remove('hidden');

    // 4. Append the clonned setting template element to the settings list element.
    const settingsListElement = document.querySelector(selectors.settingsList);
    settingsListElement.appendChild(settingTemplateElementCopy);
}

/**
 * Toggles the empty state based on the state settings length.
 */
function toggleEmptyState() {
    const emptyStateElement = document.querySelector(selectors.emptyState);
    const settingsTable = document.querySelector(selectors.settingsTable);
    if (state.settings.length === 0) {
        emptyStateElement.classList.remove('hidden');
        settingsTable.classList.add('hidden');
    } else {
        emptyStateElement.classList.add('hidden');
        settingsTable.classList.remove('hidden');
    }
}

toggleEmptyState();

state.settings.forEach(setting => {
    // Call the function to render the settings elements.
    renderSettingElement(setting);
});