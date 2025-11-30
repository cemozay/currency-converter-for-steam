// Background Service Worker
// Currency exchange rate fetching functions

// ==================== CONSTANTS ====================

const CURRENCY_UPDATE_ALARM = "currencyUpdate";
const BASE_CURRENCY = "USD"; // Base currency for fetching all rates

// Common currency symbols and codes for detection
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
};

// ==================== CURRENCY RATES ====================

/**
 * Fetch rates from exchangerate-api.com v4 API (free, no key required)
 * @returns {Promise<{rates: object, base: string, date: string}>}
 */
async function fetchRatesFromExchangerateAPI() {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`
  );
  if (!response.ok) throw new Error(`API: ${response.status}`);

  const data = await response.json();
  if (!data.rates || typeof data.rates !== "object") {
    throw new Error("Invalid rates data");
  }

  // v4 format: {rates: {...}, base: "USD", date: "..."}
  const rates = data.rates;
  const base = data.base || BASE_CURRENCY;
  const date = data.date || new Date().toISOString().split("T")[0];

  // Add base currency with rate 1.0
  const allRates = { [BASE_CURRENCY]: 1.0, ...rates };

  return {
    rates: allRates,
    base: base,
    date: date,
  };
}

/**
 * Comprehensive currency names mapping
 * Currency names from exchangerate-api.com supported currencies page:
 * https://www.exchangerate-api.com/docs/supported-currencies
 */
const FALLBACK_CURRENCY_NAMES = {
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

/**
 * Get currency names from comprehensive hardcoded list
 * Currency names from exchangerate-api.com supported currencies
 * @returns {Promise<Object>} - Object mapping currency codes to names
 */
async function getCurrencyNames() {
  // Return the comprehensive hardcoded list
  // This covers all currencies supported by exchangerate-api.com
  return FALLBACK_CURRENCY_NAMES;
}

/**
 * Get list of available currencies from v4 API
 * @returns {Promise<string[]>} - Array of currency codes
 */
async function getAvailableCurrencies() {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`
    );
    if (!response.ok) throw new Error(`API: ${response.status}`);

    const data = await response.json();
    if (data.rates && typeof data.rates === "object") {
      // Return base currency + all rate currencies
      return [BASE_CURRENCY, ...Object.keys(data.rates)].sort();
    }
    throw new Error("Invalid currency data");
  } catch (error) {
    console.error("Error fetching currencies:", error);
    // Final fallback to common currencies
    return [
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
    ].sort();
  }
}

/**
 * Update exchange rates from exchangerate-api.com
 * @returns {Promise<void>}
 */
async function updateExchangeRates() {
  let result = null;
  let error = null;

  // Use exchangerate-api.com
  try {
    result = await fetchRatesFromExchangerateAPI();
  } catch (err) {
    console.error("exchangerate-api.com failed:", err);
    error = err;
  }

  if (result && result.rates && Object.keys(result.rates).length > 0) {
    await chrome.storage.local.set({
      exchangeRates: {
        rates: result.rates,
        base: result.base || BASE_CURRENCY,
        date: result.date,
        lastUpdate: new Date().toISOString(),
      },
      exchangeRatesError: null,
    });
    // Exchange rates updated successfully
  } else {
    // Failed, keep existing or use minimal defaults
    const current = await chrome.storage.local.get(["exchangeRates"]);
    if (!current.exchangeRates || !current.exchangeRates.rates) {
      // Create minimal default rates (USD base with common currencies)
      const defaultRates = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 150.0,
        TRY: 40.0,
        CAD: 1.35,
        AUD: 1.52,
        CHF: 0.88,
        CNY: 7.2,
        INR: 83.0,
        KRW: 1330.0,
        MXN: 17.0,
        BRL: 4.95,
        RUB: 92.0,
        PLN: 4.0,
        SEK: 10.5,
        NOK: 10.8,
        DKK: 6.85,
      };
      await chrome.storage.local.set({
        exchangeRates: {
          rates: defaultRates,
          base: BASE_CURRENCY,
          date: new Date().toISOString().split("T")[0],
          lastUpdate: new Date().toISOString(),
        },
        exchangeRatesError: error?.message || "Rates could not be fetched",
      });
      // Using default rates (API failed)
    } else {
      // Keep existing value, just record error
      await chrome.storage.local.set({
        exchangeRatesError: error?.message || "Rates could not be fetched",
      });
      // Rates update failed, keeping existing values
    }
  }
}

// ==================== ALARM HANDLERS ====================

/**
 * Alarm listener - Daily update
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CURRENCY_UPDATE_ALARM) {
    // Currency update alarm triggered
    updateExchangeRates();
  }
});

// ==================== MESSAGE HANDLERS ====================

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateExchangeRates") {
    updateExchangeRates()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response
  }

  if (request.action === "getData") {
    chrome.storage.local
      .get([
        "exchangeRates",
        "exchangeRatesError",
        "targetCurrency",
        "steamCurrency",
      ])
      .then((data) => {
        sendResponse(data);
      });
    return true; // Async response
  }

  if (request.action === "getAvailableCurrencies") {
    getAvailableCurrencies()
      .then((currencies) => {
        sendResponse({ success: true, currencies });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response
  }

  if (request.action === "getCurrencyNames") {
    getCurrencyNames()
      .then((names) => {
        sendResponse({ success: true, currencyNames: names });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response
  }
});

// ==================== INITIALIZATION ====================

/**
 * Initial setup - Set default values and create alarms
 */
async function initialize() {
  // Extension initializing...

  // Check existing values
  const data = await chrome.storage.local.get(["exchangeRates", "initialized"]);

  // If not first install, just check alarm
  if (data.initialized) {
    // Check alarm, create if missing
    const alarms = await chrome.alarms.getAll();
    const hasCurrencyAlarm = alarms.some(
      (a) => a.name === CURRENCY_UPDATE_ALARM
    );

    if (!hasCurrencyAlarm) {
      chrome.alarms.create(CURRENCY_UPDATE_ALARM, { periodInMinutes: 24 * 60 }); // Once per day
    }

    return;
  }

  // First install
  // Performing initial setup...

  // Set default values
  const defaultRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.0,
    TRY: 40.0,
    CAD: 1.35,
    AUD: 1.52,
    CHF: 0.88,
    CNY: 7.2,
    INR: 83.0,
    KRW: 1330.0,
    MXN: 17.0,
    BRL: 4.95,
    RUB: 92.0,
    PLN: 4.0,
    SEK: 10.5,
    NOK: 10.8,
    DKK: 6.85,
  };

  await chrome.storage.local.set({
    targetCurrency: "USD", // Default target currency
    exchangeRates: {
      rates: defaultRates,
      base: BASE_CURRENCY,
      date: new Date().toISOString().split("T")[0],
      lastUpdate: new Date().toISOString(),
    },
    initialized: true,
  });

  // Create alarm (update once per day)
  chrome.alarms.create(CURRENCY_UPDATE_ALARM, {
    delayInMinutes: 1, // First update after 1 minute
    periodInMinutes: 24 * 60, // Then once per day
  });

  // Perform first update
  updateExchangeRates();

  // Extension initialized
}

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    initialize().catch((error) => {
      console.error("Initialize error:", error);
    });
  }
});

// Check alarms when service worker starts
// (To catch service worker wake-up)
(async function checkInitialization() {
  try {
    const data = await chrome.storage.local.get(["initialized"]);
    if (data.initialized) {
      // Check alarm, create if missing
      const alarms = await chrome.alarms.getAll();
      const hasCurrencyAlarm = alarms.some(
        (a) => a.name === CURRENCY_UPDATE_ALARM
      );

      if (!hasCurrencyAlarm) {
        chrome.alarms.create(CURRENCY_UPDATE_ALARM, {
          periodInMinutes: 24 * 60,
        });
      }
    } else {
      // Not initialized yet, initialize (first load)
      await initialize();
    }
  } catch (error) {
    console.error("Service worker startup error:", error);
    // Try to initialize even on error
    initialize().catch((err) => {
      console.error("Initialize fallback error:", err);
    });
  }
})();
