// Internationalization (i18n) for Turkish and English
// Supports: tr (Turkish), en (English)

const translations = {
  en: {
    // Header
    title: "Currency Converter",

    // Currency Selection
    targetCurrency: "Target Currency",
    convertTo: "Convert to:",
    steamCurrency: "Steam Currency:",
    exchangeRate: "Exchange Rate:",
    loadingCurrencies: "Loading currencies...",

    // Exchange Rates
    exchangeRates: "Exchange Rates",
    baseCurrency: "Base Currency:",
    lastUpdate: "Last Update:",
    availableCurrencies: "Available Currencies:",
    refreshRates: "Refresh Rates",
    updating: "Updating...",
    error: "Error",

    // Time
    justNow: "Just now",
    minuteAgo: "minute ago",
    minutesAgo: "minutes ago",
    hourAgo: "hour ago",
    hoursAgo: "hours ago",
    dayAgo: "day ago",
    daysAgo: "days ago",
    notUpdatedYet: "Not updated yet",

    // Settings
    language: "Language:",
    extensionEnabled: "Extension Enabled",
    extensionDisabled: "Extension Disabled",
  },
  tr: {
    // Header
    title: "Para Birimi Dönüştürücü",

    // Currency Selection
    targetCurrency: "Hedef Para Birimi",
    convertTo: "Dönüştür:",
    steamCurrency: "Steam Para Birimi:",
    exchangeRate: "Döviz Kuru:",
    loadingCurrencies: "Para birimleri yükleniyor...",

    // Exchange Rates
    exchangeRates: "Döviz Kurları",
    baseCurrency: "Temel Para Birimi:",
    lastUpdate: "Son Güncelleme:",
    availableCurrencies: "Mevcut Para Birimleri:",
    refreshRates: "Kurları Yenile",
    updating: "Güncelleniyor...",
    error: "Hata",

    // Time
    justNow: "Az önce",
    minuteAgo: "dakika önce",
    minutesAgo: "dakika önce",
    hourAgo: "saat önce",
    hoursAgo: "saat önce",
    dayAgo: "gün önce",
    daysAgo: "gün önce",
    notUpdatedYet: "Henüz güncellenmedi",

    // Settings
    language: "Dil:",
    extensionEnabled: "Uzantı Etkin",
    extensionDisabled: "Uzantı Devre Dışı",
  },
};

/**
 * Get current language from storage or browser default
 * @returns {Promise<string>} - Language code ('tr' or 'en')
 */
async function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["language"], (data) => {
      if (data.language) {
        resolve(data.language);
      } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const lang = browserLang.startsWith("tr") ? "tr" : "en";
        resolve(lang);
      }
    });
  });
}

/**
 * Set language
 * @param {string} lang - Language code ('tr' or 'en')
 */
async function setLanguage(lang) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ language: lang }, () => {
      resolve();
    });
  });
}

/**
 * Get translated text
 * @param {string} key - Translation key
 * @param {string} lang - Language code (optional, will be detected if not provided)
 * @returns {Promise<string>} - Translated text
 */
async function t(key, lang = null) {
  const currentLang = lang || (await getLanguage());
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

/**
 * Get all translations for current language
 * @param {string} lang - Language code (optional)
 * @returns {Promise<Object>} - All translations for the language
 */
async function getAllTranslations(lang = null) {
  const currentLang = lang || (await getLanguage());
  return translations[currentLang] || translations.en;
}
