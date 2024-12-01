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

  // use collections object for shorten field names, like collections.selectAllInput instead of selectAllCollectionsInput
  collections: {
      selectAllInput: '#select-all-collections-input',
      searchInput: '#search-collection-input',
      selectedQuantity: '#selected-collections-quantity',

      searchResultsContainer: '#search-collections-results-container',
      searchResultTemplate: '#serach-collection-result-template',
      selectAllWrapper: '#select-all-collections-wrapper',
      selectAllCheckbox: '.custom-checkbox-input',
      checkboxLabel: '.custom-checkbox-label',
      selectInput: '.custom-checkbox-input',
      title: '.custom-checkbox-label-title',

      cancelButton: '[aria-controls="cancel-selected-collections"]',
      saveButton: '[aria-controls="save-selected-collections"]'
  },

  products: {
      searchInput: '#search-product-input',
      selectedQuantity: '#selected-products-quantity',

      selectAllWrapper: '#select-all-products-wrapper',
      selectAllCheckbox: '#select-all-products',

      searchResultsContainer: '#search-products-results-container',
      searchResultTemplate: '#search-product-result-template',
      productLine: '.search-result-product',
      selectProductInput: '.custom-checkbox-input',
      selectProductLabel: '.custom-checkbox-label',
      productTitle: '.product-title',

      variantLine: '.search-result-variant',
      selectVariantLabel: '.custom-checkbox-label',
      selectVariantInput: '.custom-checkbox-input',
      variantTitle: '.variant-title',

      cancelButton: '[aria-controls="cancel-selected-products"]',
      saveButton: '[aria-controls="save-selected-products"]',
  },
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
const searchCollectionsResultsContainer = document.querySelector(selectors.collections.searchResultsContainer);
const searchProductsResultsContainer = document.querySelector(selectors.products.searchResultsContainer);

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
  return searchCurrencyResultCopy;
}

/**
* Creates the search result html element for the collection search.
* 
* @param {Object} collection - The collection object.
* @returns {HTMLElement} - The search collection result html element.
*/
function createCollectionSearchResult(collection) {
  const searchResultTemplate = document.querySelector(selectors.collections.searchResultTemplate);
  const searchResultCopy = searchResultTemplate.cloneNode(true);
  const selectInput = searchResultCopy.querySelector(selectors.collections.selectInput);
  const checkboxLabel = searchResultCopy.querySelector(selectors.collections.checkboxLabel);
  const title = searchResultCopy.querySelector(selectors.collections.title);
  searchResultCopy.id = `search-result-${collection.id}`;
  searchResultCopy.classList.remove('hidden');
  selectInput.value = collection.id;
  selectInput.id = collection.id;
  checkboxLabel.htmlFor = collection.id;
  title.innerText = collection.title;
  return searchResultCopy;
}

/**
* Creates the search result html element for the variant search.
* 
* @param {Object} variant - The variant object.
* @returns {HTMLElement} - The search variant result html element.
*/
function createVariantSearchResult(variant) {
  const variantLineTemplate = document.querySelector(selectors.products.variantLine);
  const variantLine = variantLineTemplate.cloneNode(true);
  const selectLabel = variantLine.querySelector(selectors.products.selectVariantLabel);
  const selectInput = variantLine.querySelector(selectors.products.selectVariantInput);
  const title = variantLine.querySelector(selectors.products.variantTitle);
  variantLine.id = `search-variant-result-${variant.id}`;
  variantLine.classList.remove('hidden');
  selectInput.value = variant.id;
  selectInput.id = `select-variant-${variant.id}`;
  selectLabel.htmlFor = `select-variant-${variant.id}`;
  title.innerText = variant.title;
  return variantLine;
}

/**
* Creates the search result html element for the product search.
* 
* @param {Object} product - The product object.
* @returns {HTMLElement} - The search product result html element.
*/
function createProductSearchResult(product) {
  const searchResultTemplate = document.querySelector(selectors.products.searchResultTemplate);
  const searchResultCopy = searchResultTemplate.cloneNode(true);
  const selectInput = searchResultCopy.querySelector(selectors.products.selectProductInput);
  const checkboxLabel = searchResultCopy.querySelector(selectors.products.selectProductLabel);
  const title = searchResultCopy.querySelector(selectors.products.productTitle);
  searchResultCopy.id = `search-product-result-${product.id}`;
  searchResultCopy.classList.remove('hidden');
  selectInput.value = product.id;
  selectInput.id = `select-product-${product.id}`;
  checkboxLabel.htmlFor = `select-product-${product.id}`;
  title.innerText = product.title;

  if (product.variants?.length > 0) {
      for (const variant of product.variants) {
          const variantSearchResult = createVariantSearchResult(variant);
          searchResultCopy.insertAdjacentElement('beforeend', variantSearchResult);
      }
  }
  
  return searchResultCopy;
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

  for (const collection of state.collections) {
      const collectionSearchResult = createCollectionSearchResult(collection);
      searchCollectionsResultsContainer.insertAdjacentElement('afterbegin', collectionSearchResult);
  }

  for (const product of state.products) {
      const productSearchResult = createProductSearchResult(product);
      searchProductsResultsContainer.insertAdjacentElement('afterbegin', productSearchResult);
  }
}

renderPage();