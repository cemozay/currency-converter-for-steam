// Internationalization (i18n) using Chrome's native i18n API
// Translations stored in _locales/[locale]/messages.json
// Supports runtime language switching by loading locale files dynamically

// Cache for loaded translations
let translationsCache = {};

/**
 * Get current language from storage or browser default
 * @returns {Promise<string>} - Language code ('tr' or 'en')
 */
async function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["language"], (data) => {
      if (data.language && (data.language === "tr" || data.language === "en")) {
        resolve(data.language);
      } else {
        // Detect browser language using Chrome i18n API
        const browserLang = chrome.i18n.getUILanguage();
        const lang = browserLang.startsWith("tr") ? "tr" : "en";
        resolve(lang);
      }
    });
  });
}

/**
 * Set language preference
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
 * Load translations from _locales/[locale]/messages.json
 * @param {string} locale - Locale code
 * @returns {Promise<Object>} - Translations object
 */
async function loadTranslations(locale) {
  if (translationsCache[locale]) {
    return translationsCache[locale];
  }

  try {
    const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
    const response = await fetch(url);
    const messages = await response.json();

    // Convert Chrome i18n format to simple key-value
    const translations = {};
    for (const [key, value] of Object.entries(messages)) {
      translations[key] = value.message;
    }

    translationsCache[locale] = translations;
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fallback to English if loading fails
    if (locale !== "en") {
      return loadTranslations("en");
    }
    return {};
  }
}

/**
 * Get translated text
 * Uses Chrome's i18n API when browser locale matches, otherwise loads from _locales
 * @param {string} key - Translation key
 * @param {string} lang - Language code (optional, will be detected if not provided)
 * @returns {Promise<string>} - Translated text
 */
async function t(key, lang = null) {
  const currentLang = lang || (await getLanguage());
  const browserLang = chrome.i18n.getUILanguage().split("-")[0];

  // Use Chrome's native i18n API if browser locale matches
  if (currentLang === browserLang) {
    const message = chrome.i18n.getMessage(key);
    if (message) return message;
  }

  // Load translations for runtime language switching
  const translations = await loadTranslations(currentLang);
  return translations[key] || chrome.i18n.getMessage(key) || key;
}

/**
 * Get all translations for current language
 * @param {string} lang - Language code (optional)
 * @returns {Promise<Object>} - All translations for the language
 */
async function getAllTranslations(lang = null) {
  const currentLang = lang || (await getLanguage());
  return loadTranslations(currentLang);
}
