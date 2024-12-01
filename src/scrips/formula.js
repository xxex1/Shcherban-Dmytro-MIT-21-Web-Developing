/**
 * Gets the state object from the local storage.
 * 
 * @returns {Object} - The state object.
 */
function getState() {
  const stateJSON = localStorage.getItem('state');
  return JSON.parse(stateJSON);
}

const state = getState();

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
const settingId = params.settingId;
const currentSetting = state.settings.find(setting => setting.id == settingId);
const formulaId = params.id;

/**
* Updates the state in the local storage.
*/
function updateState() {
  localStorage.setItem('state', JSON.stringify(state));
}

/**
* Gets the current formula object. If no formula ID is provided, 
* it creates a new formula object and adds it to the current setting, 
* updates the state and returns the new formula object.
* 
* @returns {Object} - The current formula object.
*/
function getCurrentFormula() {
  const formulaTemplate = {
      id: Date.now(),
      title: 'Formula name',
      currency: 'BTC',
      formula: 'X * Y',
      frequency: 1000,
      targets: {
          collectionsIds: [],
          products: [],
      }
  }

  if (formulaId) {
      return currentSetting.formulas.find(formula => formula.id == formulaId);
  } else {
      const formula = { ...formulaTemplate };
      currentSetting.formulas.push(formula);
      updateState();
      return formula;
  }
}

let currentFormula = getCurrentFormula();
let savedFormula = { ...currentFormula };

const selectors = {
  saveButton: '[aria-controls="save"]',
  discardButton: '[aria-controls="discard"]',
  searchCrypto: '[aria-controls="search-crypto"]', // todo: toggle data-active by click

  formulaTitleInput: '.formula-title-input',
  formulaInput: '.formula-input',
  frequencyInput: '.frequency-input',
  searchCurrencyInput: '#search-currency-input',
  saveCurrencyChoiceButton: '#save-currency-choice',

  searchCurrencyResultsContainer: '.search-results',
  searchCurrencyResultTemplate: '#search-currency-result-template',
  searchCurrencyResult: '.search-currency-result',
  searchCurrencyResultInput: '.search-currency-result__radio-button_input',
  searchCurrencyResultLabel: '.search-currency-result__radio-button_label',
  searchCurrencyResultName: '.search-result-name',
}

const saveButton = document.querySelector(selectors.saveButton);
const discardButton = document.querySelector(selectors.discardButton);
const searchCrypto = document.querySelector(selectors.searchCrypto);
const formulaTitleInput = document.querySelector(selectors.formulaTitleInput);
const formulaInput = document.querySelector(selectors.formulaInput);
const frequencyInput = document.querySelector(selectors.frequencyInput);
const searchCurrencyResultsContainer = document.querySelector(selectors.searchCurrencyResultsContainer);
const searchCurrencyInput = document.querySelector(selectors.searchCurrencyInput);
const searchCurrencyResult = document.querySelector(selectors.searchCurrencyResult);
const saveCurrencyChoiceButton = document.querySelector(selectors.saveCurrencyChoiceButton);

searchCurrencyInput.addEventListener('click', () => {
  searchCrypto.dataset.active = true;
});

saveCurrencyChoiceButton.addEventListener('click', () => {
  searchCrypto.dataset.active = false;
});

/**
* Creates the search result html element for the currency search.
* 
* @param {String} currencyId - like BTC, ETH, USDT, etc
* @returns {HTMLElement} - The search result html element.
*/
function createCurrencySearchResult(currencyId) {
  const searchCurrencyResultTemplate = document.querySelector(selectors.searchCurrencyResultTemplate);
  const searchCurrencyResultCopy = searchCurrencyResultTemplate.cloneNode(true);
  const searchCurrencyResultInput = searchCurrencyResultCopy.querySelector(selectors.searchCurrencyResultInput);
  const searchCurrencyResultName = searchCurrencyResultCopy.querySelector(selectors.searchCurrencyResultName);
  const searchCurrencyResultLabel = searchCurrencyResultCopy.querySelector(selectors.searchCurrencyResultLabel);
  searchCurrencyResultCopy.id = `search-result-${currencyId}`;
  searchCurrencyResultCopy.classList.remove('hidden');
  searchCurrencyResultInput.value = currencyId;
  searchCurrencyResultInput.id = currencyId;
  searchCurrencyResultLabel.htmlFor = currencyId;
  searchCurrencyResultName.innerText = currencyId;
  console.log('✌️searchCurrencyResultCopy --->', searchCurrencyResultCopy);
  return searchCurrencyResultCopy;
}

function renderPage() {
  formulaTitleInput.value = currentFormula.title;
  formulaInput.value = currentFormula.formula;
  frequencyInput.value = currentFormula.frequency;

  for (const key in state.currencies) {
      if (Object.prototype.hasOwnProperty.call(state.currencies, key)) {
          searchCurrencyResultsContainer.insertAdjacentElement('afterbegin', createCurrencySearchResult(key));
      }
  }
}

renderPage();