// Popup JavaScript
// Communication with background service worker and UI updates

// ==================== DOM ELEMENTS ====================

const elements = {
  // Currency selector
  targetCurrency: document.getElementById("targetCurrency"),

  // Currency rates
  currencyLastUpdate: document.getElementById("currencyLastUpdate"),
  currencyError: document.getElementById("currencyError"),
  refreshCurrency: document.getElementById("refreshCurrency"),
  steamCurrency: document.getElementById("steamCurrency"),
  steamCurrencyInfo: document.getElementById("steamCurrencyInfo"),
  exchangeRate: document.getElementById("exchangeRate"),
  exchangeRateInfo: document.getElementById("exchangeRateInfo"),

  // Settings
  languageOptions: document.querySelectorAll(".lang-option"),
  extensionToggle: document.getElementById("extensionToggle"),

  // Loading
  loading: document.getElementById("loading"),
};

// Comprehensive currency names mapping
// Currency names from exchangerate-api.com supported currencies page:
// https://www.exchangerate-api.com/docs/supported-currencies
const CURRENCY_NAMES = {
  AED: "UAE Dirham",
  AFN: "Afghan Afghani",
  ALL: "Albanian Lek",
  AMD: "Armenian Dram",
  ANG: "Netherlands Antillian Guilder",
  AOA: "Angolan Kwanza",
  ARS: "Argentine Peso",
  AUD: "Australian Dollar",
  AWG: "Aruban Florin",
  AZN: "Azerbaijani Manat",
  BAM: "Bosnia and Herzegovina Mark",
  BBD: "Barbados Dollar",
  BDT: "Bangladeshi Taka",
  BGN: "Bulgarian Lev",
  BHD: "Bahraini Dinar",
  BIF: "Burundian Franc",
  BMD: "Bermudian Dollar",
  BND: "Brunei Dollar",
  BOB: "Bolivian Boliviano",
  BRL: "Brazilian Real",
  BSD: "Bahamian Dollar",
  BTN: "Bhutanese Ngultrum",
  BWP: "Botswana Pula",
  BYN: "Belarusian Ruble",
  BZD: "Belize Dollar",
  CAD: "Canadian Dollar",
  CDF: "Congolese Franc",
  CHF: "Swiss Franc",
  CLF: "Unidad de Fomento",
  CLP: "Chilean Peso",
  CNH: "Offshore Chinese Yuan",
  CNY: "Chinese Renminbi",
  COP: "Colombian Peso",
  CRC: "Costa Rican Colon",
  CUP: "Cuban Peso",
  CVE: "Cape Verdean Escudo",
  CZK: "Czech Koruna",
  DJF: "Djiboutian Franc",
  DKK: "Danish Krone",
  DOP: "Dominican Peso",
  DZD: "Algerian Dinar",
  EGP: "Egyptian Pound",
  ERN: "Eritrean Nakfa",
  ETB: "Ethiopian Birr",
  EUR: "Euro",
  FJD: "Fiji Dollar",
  FKP: "Falkland Islands Pound",
  FOK: "Faroese Króna",
  GBP: "Pound Sterling",
  GEL: "Georgian Lari",
  GGP: "Guernsey Pound",
  GHS: "Ghanaian Cedi",
  GIP: "Gibraltar Pound",
  GMD: "Gambian Dalasi",
  GNF: "Guinean Franc",
  GTQ: "Guatemalan Quetzal",
  GYD: "Guyanese Dollar",
  HKD: "Hong Kong Dollar",
  HNL: "Honduran Lempira",
  HRK: "Croatian Kuna",
  HTG: "Haitian Gourde",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  IMP: "Manx Pound",
  INR: "Indian Rupee",
  IQD: "Iraqi Dinar",
  IRR: "Iranian Rial",
  ISK: "Icelandic Króna",
  JEP: "Jersey Pound",
  JMD: "Jamaican Dollar",
  JOD: "Jordanian Dinar",
  JPY: "Japanese Yen",
  KES: "Kenyan Shilling",
  KGS: "Kyrgyzstani Som",
  KHR: "Cambodian Riel",
  KID: "Kiribati Dollar",
  KMF: "Comorian Franc",
  KRW: "South Korean Won",
  KWD: "Kuwaiti Dinar",
  KYD: "Cayman Islands Dollar",
  KZT: "Kazakhstani Tenge",
  LAK: "Lao Kip",
  LBP: "Lebanese Pound",
  LKR: "Sri Lanka Rupee",
  LRD: "Liberian Dollar",
  LSL: "Lesotho Loti",
  LYD: "Libyan Dinar",
  MAD: "Moroccan Dirham",
  MDL: "Moldovan Leu",
  MGA: "Malagasy Ariary",
  MKD: "Macedonian Denar",
  MMK: "Burmese Kyat",
  MNT: "Mongolian Tögrög",
  MOP: "Macanese Pataca",
  MRU: "Mauritanian Ouguiya",
  MUR: "Mauritian Rupee",
  MVR: "Maldivian Rufiyaa",
  MWK: "Malawian Kwacha",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  MZN: "Mozambican Metical",
  NAD: "Namibian Dollar",
  NGN: "Nigerian Naira",
  NIO: "Nicaraguan Córdoba",
  NOK: "Norwegian Krone",
  NPR: "Nepalese Rupee",
  NZD: "New Zealand Dollar",
  OMR: "Omani Rial",
  PAB: "Panamanian Balboa",
  PEN: "Peruvian Sol",
  PGK: "Papua New Guinean Kina",
  PHP: "Philippine Peso",
  PKR: "Pakistani Rupee",
  PLN: "Polish Złoty",
  PYG: "Paraguayan Guaraní",
  QAR: "Qatari Riyal",
  RON: "Romanian Leu",
  RSD: "Serbian Dinar",
  RUB: "Russian Ruble",
  RWF: "Rwandan Franc",
  SAR: "Saudi Riyal",
  SBD: "Solomon Islands Dollar",
  SCR: "Seychellois Rupee",
  SDG: "Sudanese Pound",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  SHP: "Saint Helena Pound",
  SLE: "Sierra Leonean Leone",
  SLL: "Sierra Leonean Leone",
  SOS: "Somali Shilling",
  SRD: "Surinamese Dollar",
  SSP: "South Sudanese Pound",
  STN: "São Tomé and Príncipe Dobra",
  SYP: "Syrian Pound",
  SZL: "Eswatini Lilangeni",
  THB: "Thai Baht",
  TJS: "Tajikistani Somoni",
  TMT: "Turkmenistan Manat",
  TND: "Tunisian Dinar",
  TOP: "Tongan Paʻanga",
  TRY: "Turkish Lira",
  TTD: "Trinidad and Tobago Dollar",
  TVD: "Tuvaluan Dollar",
  TWD: "New Taiwan Dollar",
  TZS: "Tanzanian Shilling",
  UAH: "Ukrainian Hryvnia",
  UGX: "Ugandan Shilling",
  USD: "United States Dollar",
  UYU: "Uruguayan Peso",
  UZS: "Uzbekistani So'm",
  VES: "Venezuelan Bolívar Soberano",
  VND: "Vietnamese Đồng",
  VUV: "Vanuatu Vatu",
  WST: "Samoan Tālā",
  XAF: "Central African CFA Franc",
  XCD: "East Caribbean Dollar",
  XCG: "Caribbean Guilder",
  XDR: "Special Drawing Rights",
  XOF: "West African CFA franc",
  XPF: "CFP Franc",
  YER: "Yemeni Rial",
  ZAR: "South African Rand",
  ZMW: "Zambian Kwacha",
  ZWL: "Zimbabwean Dollar",
};

// Currency symbols
const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  KRW: "₩",
  TRY: "₺",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  MXN: "MX$",
  RUB: "₽",
  PLN: "zł",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  CHF: "CHF",
  NZD: "NZ$",
  ZAR: "R",
  SGD: "S$",
  HKD: "HK$",
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Send message to background
 * @param {object} message - Message to send
 * @returns {Promise<any>} - Response
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Format time difference in human-readable format (with i18n)
 * @param {string} isoDate - ISO date string
 * @param {string} lang - Language code
 * @returns {Promise<string>} - Human-readable time difference
 */
async function formatTimeAgo(isoDate, lang = null) {
  if (!isoDate) return await t("notUpdatedYet", lang);

  const currentLang = lang || (await getLanguage());
  const translations = await getAllTranslations(currentLang);

  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return translations.justNow;
  if (diffMins < 60) {
    return `${diffMins} ${
      diffMins === 1 ? translations.minuteAgo : translations.minutesAgo
    }`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${
      diffHours === 1 ? translations.hourAgo : translations.hoursAgo
    }`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${
      diffDays === 1 ? translations.dayAgo : translations.daysAgo
    }`;
  }
  return date.toLocaleDateString(currentLang === "tr" ? "tr-TR" : "en-US");
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
async function applyTranslations() {
  const translations = await getAllTranslations();
  const lang = await getLanguage();

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Update all elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (translations[key]) {
      element.placeholder = translations[key];
    }
  });
}

/**
 * Format currency name for display in selector
 * @param {string} code - Currency code
 * @returns {string} - Formatted currency name (e.g., "Turkish Lira (TRY)")
 */
function formatCurrencyName(code) {
  const name = CURRENCY_NAMES[code];
  if (name) {
    return `${name} (${code})`;
  }
  // Fallback: if name not found, just show code
  return code;
}

/**
 * Show/hide loading indicator
 * @param {boolean} show - Show indicator?
 */
function setLoading(show) {
  elements.loading.style.display = show ? "flex" : "none";
}

// ==================== UPDATE UI ====================

/**
 * Get target currency from storage
 */
async function getTargetCurrency() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["targetCurrency"], (data) => {
      resolve(data.targetCurrency || "USD");
    });
  });
}

/**
 * Save target currency to storage
 */
async function setTargetCurrency(currency) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ targetCurrency: currency }, () => {
      resolve();
    });
  });
}

/**
 * Load settings (language and extension toggle)
 */
async function loadSettings() {
  // Load language
  const lang = await getLanguage();
  // Update active language indicator
  elements.languageOptions.forEach((option) => {
    if (option.getAttribute("data-lang") === lang) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });

  // Load extension enabled state
  chrome.storage.local.get(["extensionEnabled"], (data) => {
    // Default to true if not set
    const isEnabled = data.extensionEnabled !== false;
    elements.extensionToggle.checked = isEnabled;
  });
}

/**
 * Update currency UI with data from storage
 * @param {object} data - Data from storage
 */
async function updateCurrencyUI(data) {
  const rates = data.exchangeRates;
  const error = data.exchangeRatesError;
  const lastUpdate = rates?.lastUpdate;
  const targetCurrency = data.targetCurrency || "USD";

  // Steam currency - always show if available
  if (data.steamCurrency) {
    elements.steamCurrency.textContent = formatCurrencyName(data.steamCurrency);
    elements.steamCurrencyInfo.style.display = "flex";
  } else {
    elements.steamCurrencyInfo.style.display = "none";
  }

  // Exchange rate (Steam currency to target currency) - always show
  elements.exchangeRateInfo.style.display = "flex";
  
  if (data.steamCurrency && targetCurrency && rates?.rates) {
    const steamCur = data.steamCurrency;
    const targetCur = targetCurrency;

    if (
      steamCur !== targetCur &&
      rates.rates[steamCur] &&
      rates.rates[targetCur]
    ) {
      // Calculate rate: 1 Steam Currency = X Target Currency
      const rate = rates.rates[targetCur] / rates.rates[steamCur];

      // Format rate based on value for better readability
      let rateText;
      if (rate >= 1) {
        // For rates >= 1, show: 1 USD = 30.00 TRY
        rateText = `1 ${steamCur} = ${rate.toFixed(2)} ${targetCur}`;
      } else {
        // For rates < 1, show reverse: 1 TRY = 0.03 USD
        const reverseRate = 1 / rate;
        rateText = `1 ${targetCur} = ${reverseRate.toFixed(2)} ${steamCur}`;
      }

      elements.exchangeRate.textContent = rateText;
    } else if (steamCur === targetCur) {
      // Same currency, no conversion needed
      elements.exchangeRate.textContent = "Same currency";
    } else {
      // Missing rate data
      elements.exchangeRate.textContent = "--";
    }
  } else {
    // Not enough data yet
    elements.exchangeRate.textContent = "--";
  }

  // Last update - always show
  if (lastUpdate) {
    elements.currencyLastUpdate.textContent = await formatTimeAgo(lastUpdate);
  } else {
    const notUpdatedText = await t("notUpdatedYet");
    elements.currencyLastUpdate.textContent = notUpdatedText;
  }

  // Error message
  if (error) {
    const errorText = await t("error");
    elements.currencyError.textContent = `${errorText}: ${error}`;
    elements.currencyError.style.display = "block";
  } else {
    elements.currencyError.style.display = "none";
  }
}

/**
 * Load currencies and populate selector
 */
async function loadCurrencies() {
  try {
    const response = await sendMessage({ action: "getAvailableCurrencies" });
    if (response && response.success && response.currencies) {
      populateCurrencySelector(response.currencies);
      return;
    }
  } catch (error) {
    console.warn("Could not load currencies from background:", error);
  }

  // Fallback to common currencies if API call fails
  try {
    const commonCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "AUD",
      "CAD",
      "CHF",
      "CNY",
      "INR",
      "KRW",
      "MXN",
      "BRL",
      "RUB",
      "TRY",
      "PLN",
      "SEK",
      "NOK",
      "DKK",
      "NZD",
      "ZAR",
      "SGD",
      "HKD",
    ];
    populateCurrencySelector(commonCurrencies);
  } catch (error) {
    console.error("Error loading currencies:", error);
    // Fallback
    const commonCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "AUD",
      "CAD",
      "CHF",
      "CNY",
      "INR",
      "KRW",
      "MXN",
      "BRL",
      "RUB",
      "TRY",
      "PLN",
      "SEK",
      "NOK",
      "DKK",
      "NZD",
      "ZAR",
      "SGD",
      "HKD",
    ];
    populateCurrencySelector(commonCurrencies);
  }
}

/**
 * Populate currency selector dropdown
 * @param {string[]} currencies - Array of currency codes
 */
function populateCurrencySelector(currencies) {
  const selector = elements.targetCurrency;
  selector.innerHTML = "";

  currencies.forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = formatCurrencyName(code);
    selector.appendChild(option);
  });
}

/**
 * Update entire UI
 */
async function updateUI() {
  try {
    // Apply translations first
    await applyTranslations();

    const data = await sendMessage({ action: "getData" });
    await updateCurrencyUI(data);

    // Set current target currency in selector
    const currentCurrency = await getTargetCurrency();
    if (elements.targetCurrency) {
      elements.targetCurrency.value = currentCurrency;
    }
  } catch (error) {
    console.error("UI update error:", error);
  }
}

// ==================== EVENT HANDLERS ====================

/**
 * Exchange rate refresh button
 */
elements.refreshCurrency.addEventListener("click", async () => {
  elements.refreshCurrency.disabled = true;
  setLoading(true);

  try {
    const response = await sendMessage({ action: "updateExchangeRates" });
    if (response.success) {
      // Wait a bit for API call to complete
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await updateUI();
    } else {
      console.error("Exchange rate update error:", response.error);
      await updateUI(); // Update UI even on error
    }
  } catch (error) {
    console.error("Message send error:", error);
  } finally {
    elements.refreshCurrency.disabled = false;
    setLoading(false);
  }
});

/**
 * Target currency change handler
 */
elements.targetCurrency.addEventListener("change", async (e) => {
  const currency = e.target.value;
  if (!currency) return;

  await setTargetCurrency(currency);

  // Notify content script (to reconvert prices) - only if Steam tab is active
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes("steampowered.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "targetCurrencyChanged",
          currency,
        }).catch(() => {}); // Ignore errors if content script not ready
      }
    });
  } catch (e) {
    // Ignore - no content script available
  }
});

/**
 * Language selector click handlers
 */
elements.languageOptions.forEach((option) => {
  option.addEventListener("click", async () => {
    const lang = option.getAttribute("data-lang");
    await setLanguage(lang);
    await loadSettings(); // Update active state
    await applyTranslations();
    await updateUI();
  });
});

/**
 * Extension toggle handler
 */
elements.extensionToggle.addEventListener("change", async (e) => {
  const isEnabled = e.target.checked;
  
  // Save to storage
  await new Promise((resolve) => {
    chrome.storage.local.set({ extensionEnabled: isEnabled }, resolve);
  });

  // Notify content script - only if Steam tab is active
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes("steampowered.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "extensionToggled",
          enabled: isEnabled,
        }).catch(() => {}); // Ignore errors if content script not ready
      }
    });
  } catch (e) {
    // Ignore - no content script available
  }
});

// ==================== INITIALIZATION ====================

/**
 * Update UI when popup opens
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Load settings first (language and API key)
  await loadSettings();

  // Apply translations
  await applyTranslations();

  // Load currencies
  await loadCurrencies();

  // Load current target currency
  const currentCurrency = await getTargetCurrency();
  if (elements.targetCurrency) {
    elements.targetCurrency.value = currentCurrency;
  }

  // Update UI
  await updateUI();

  // Listen for storage changes (updates from other tabs)
  chrome.storage.onChanged.addListener(async () => {
    await updateUI();
  });
});
