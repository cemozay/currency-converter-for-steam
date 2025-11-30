// Content Script
// Converts game prices on Steam pages to selected currency
// Uses regex-based automatic price detection (no hardcoded selectors)

// ==================== CONSTANTS ====================

const PROCESSED_ATTR = "data-price-processed";
const ORIGINAL_TEXT_ATTR = "data-original-text";
const CONVERTED_TEXT_ATTR = "data-converted-text";

// Elements to skip during TreeWalker traversal
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "CANVAS",
  "SVG",
  "VIDEO",
  "AUDIO",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
]);

// Currency symbols and patterns for detection and parsing
// Based on Steam's supported currencies
const CURRENCY_PATTERNS = [
  // Major currencies
  {
    code: "USD",
    symbols: ["$"],
    codes: ["USD", "US$"],
    pattern: /\$|USD|US\$/i,
  },
  {
    code: "EUR",
    symbols: ["€"],
    codes: ["EUR", "EURO"],
    pattern: /€|EUR|EURO/i,
  },
  { code: "GBP", symbols: ["£"], codes: ["GBP"], pattern: /£|GBP/i },
  { code: "JPY", symbols: ["¥", "￥"], codes: ["JPY"], pattern: /¥|￥|JPY/i },
  {
    code: "CNY",
    symbols: ["¥", "￥", "元"],
    codes: ["CNY", "RMB"],
    pattern: /¥|￥|元|CNY|RMB/i,
  },

  // Americas
  { code: "BRL", symbols: ["R$"], codes: ["BRL"], pattern: /R\$|BRL/i },
  {
    code: "CAD",
    symbols: ["C$", "CA$"],
    codes: ["CAD"],
    pattern: /C\$|CA\$|CAD/i,
  },
  {
    code: "MXN",
    symbols: ["Mex$", "MX$"],
    codes: ["MXN"],
    pattern: /Mex\$|MX\$|MXN/i,
  },
  {
    code: "CLP",
    symbols: ["CLP$", "$"],
    codes: ["CLP"],
    pattern: /CLP\$|CLP/i,
  },
  {
    code: "COP",
    symbols: ["COL$", "$"],
    codes: ["COP"],
    pattern: /COL\$|COP/i,
  },
  { code: "CRC", symbols: ["₡"], codes: ["CRC"], pattern: /₡|CRC/i },
  { code: "PEN", symbols: ["S/"], codes: ["PEN"], pattern: /S\/|PEN/i },
  {
    code: "UYU",
    symbols: ["$U", "UYU$"],
    codes: ["UYU"],
    pattern: /\$U|UYU\$|UYU/i,
  },

  // Europe
  {
    code: "TRY",
    symbols: ["₺", "TL"],
    codes: ["TRY", "TL"],
    pattern: /₺|TRY|TL/i,
  },
  { code: "RUB", symbols: ["₽"], codes: ["RUB"], pattern: /₽|RUB/i },
  { code: "PLN", symbols: ["zł", "zl"], codes: ["PLN"], pattern: /zł|zl|PLN/i },
  { code: "UAH", symbols: ["₴"], codes: ["UAH"], pattern: /₴|UAH/i },
  { code: "CHF", symbols: ["CHF", "Fr"], codes: ["CHF"], pattern: /CHF|Fr/i },
  { code: "SEK", symbols: ["kr"], codes: ["SEK"], pattern: /SEK/i },
  { code: "NOK", symbols: ["kr"], codes: ["NOK"], pattern: /NOK/i },
  { code: "DKK", symbols: ["kr"], codes: ["DKK"], pattern: /DKK/i },

  // Asia Pacific
  {
    code: "AUD",
    symbols: ["A$", "AU$"],
    codes: ["AUD"],
    pattern: /A\$|AU\$|AUD/i,
  },
  { code: "NZD", symbols: ["NZ$"], codes: ["NZD"], pattern: /NZ\$|NZD/i },
  { code: "SGD", symbols: ["S$"], codes: ["SGD"], pattern: /S\$|SGD/i },
  { code: "HKD", symbols: ["HK$"], codes: ["HKD"], pattern: /HK\$|HKD/i },
  { code: "TWD", symbols: ["NT$"], codes: ["TWD"], pattern: /NT\$|TWD/i },
  { code: "KRW", symbols: ["₩"], codes: ["KRW"], pattern: /₩|KRW/i },
  {
    code: "INR",
    symbols: ["₹", "Rs"],
    codes: ["INR"],
    pattern: /₹|Rs\.?|INR/i,
  },
  { code: "IDR", symbols: ["Rp"], codes: ["IDR"], pattern: /Rp\.?|IDR/i },
  { code: "MYR", symbols: ["RM"], codes: ["MYR"], pattern: /RM|MYR/i },
  { code: "PHP", symbols: ["₱"], codes: ["PHP"], pattern: /₱|PHP/i },
  { code: "THB", symbols: ["฿"], codes: ["THB"], pattern: /฿|THB/i },
  { code: "VND", symbols: ["₫"], codes: ["VND"], pattern: /₫|VND/i },
  { code: "KZT", symbols: ["₸"], codes: ["KZT"], pattern: /₸|KZT/i },

  // Middle East
  { code: "AED", symbols: ["د.إ"], codes: ["AED"], pattern: /د\.إ|AED/i },
  {
    code: "SAR",
    symbols: ["ر.س", "SR"],
    codes: ["SAR"],
    pattern: /ر\.س|SR|SAR/i,
  },
  {
    code: "QAR",
    symbols: ["ر.ق", "QR"],
    codes: ["QAR"],
    pattern: /ر\.ق|QR|QAR/i,
  },
  {
    code: "KWD",
    symbols: ["د.ك", "KD"],
    codes: ["KWD"],
    pattern: /د\.ك|KD|KWD/i,
  },
  { code: "ILS", symbols: ["₪"], codes: ["ILS"], pattern: /₪|ILS/i },

  // Africa
  { code: "ZAR", symbols: ["R"], codes: ["ZAR"], pattern: /ZAR/i },
];

// Master regex to detect any price-like text
// Matches patterns like: $59.99, $1,299.00, €24.99, 59.99€, USD 19.99, 29.99 USD, ₺1.234,56
// Includes all Steam-supported currency symbols
const PRICE_REGEX =
  /(?:[\$€£¥₹₩₺₽₡₴₱฿₫₸₪]|R\$|C\$|A\$|NZ\$|HK\$|S\$|MX\$|US\$|CA\$|AU\$|NT\$|COL\$|CLP\$|\$U|UYU\$|Rp\.?|RM|S\/|د\.إ|ر\.س|ر\.ق|د\.ك|SR|QR|KD)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:[\$€£¥₹₩₺₽₡₴₱฿₫₸₪]|USD|EUR|GBP|JPY|CNY|INR|KRW|TRY|TL|BRL|CAD|AUD|MXN|RUB|PLN|SEK|NOK|DKK|CHF|NZD|ZAR|SGD|HKD|TWD|IDR|MYR|PHP|THB|VND|KZT|AED|SAR|QAR|KWD|ILS|CLP|COP|CRC|PEN|UYU|UAH|RMB)/i;

// Pattern to detect percentage (to skip discount percentages like -15%)
const PERCENTAGE_REGEX = /^-?\d+\s*%$/;

// Extension enabled state (cached)
let extensionEnabled = true;

// Flag to track if extension context is still valid
let contextValid = true;

// ==================== CONTEXT VALIDATION ====================

/**
 * Check if the extension context is still valid
 * Context becomes invalid when extension is reloaded, updated, or disabled
 * @returns {boolean}
 */
function isContextValid() {
  try {
    // chrome.runtime.id is undefined when context is invalidated
    return contextValid && !!chrome.runtime?.id;
  } catch (e) {
    contextValid = false;
    return false;
  }
}

/**
 * Safely execute a Chrome API call with context validation
 * @param {Function} apiCall - Function that makes Chrome API call
 * @param {*} fallbackValue - Value to return if context is invalid
 * @returns {Promise<*>}
 */
async function safeApiCall(apiCall, fallbackValue = null) {
  if (!isContextValid()) {
    return fallbackValue;
  }
  try {
    return await apiCall();
  } catch (e) {
    if (e.message?.includes("Extension context invalidated")) {
      contextValid = false;
      // Extension context invalidated - user should refresh the page
    }
    return fallbackValue;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if extension is enabled
 * @returns {Promise<boolean>}
 */
async function isExtensionEnabled() {
  if (!isContextValid()) {
    return false;
  }

  return safeApiCall(() => {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(["extensionEnabled"], (data) => {
          if (chrome.runtime.lastError) {
            contextValid = false;
            resolve(false);
            return;
          }
          // Default to true if not set
          extensionEnabled = data.extensionEnabled !== false;
          resolve(extensionEnabled);
        });
      } catch (e) {
        contextValid = false;
        resolve(false);
      }
    });
  }, false);
}

/**
 * Parse a price string to a number, handling both EU and US formats
 * EU format: 1.234,56 (dot = thousands, comma = decimal)
 * US format: 1,234.56 (comma = thousands, dot = decimal)
 * @param {string} priceStr - Price string like "18,99" or "1,234.56"
 * @returns {number|null} - Parsed number or null if invalid
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;

  // Clean the string - remove currency symbols and whitespace
  let cleaned = priceStr.trim();

  // Count dots and commas
  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;

  // Determine format based on separator patterns
  // Case 1: Only comma, followed by 1-2 digits at end → EU decimal (18,99 → 18.99)
  if (commas === 1 && dots === 0 && /,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(",", ".");
  }
  // Case 2: Only dot, followed by 1-2 digits at end → US decimal (18.99 → 18.99)
  else if (dots === 1 && commas === 0 && /\.\d{1,2}$/.test(cleaned)) {
    // Already in correct format
  }
  // Case 3: Dot before comma (1.234,56) → EU format
  else if (
    dots > 0 &&
    commas === 1 &&
    cleaned.indexOf(".") < cleaned.indexOf(",")
  ) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }
  // Case 4: Comma before dot (1,234.56) → US format
  else if (
    commas > 0 &&
    dots === 1 &&
    cleaned.indexOf(",") < cleaned.indexOf(".")
  ) {
    cleaned = cleaned.replace(/,/g, "");
  }
  // Case 5: Only dots as thousands separators (1.234) → treat as integer with thousands
  else if (dots > 0 && commas === 0 && !/\.\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "");
  }
  // Case 6: Only commas as thousands separators (1,234) → treat as integer with thousands
  else if (commas > 0 && dots === 0 && !/,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, "");
  }
  // Case 7: Multiple commas, no dots (1,234,567) → US thousands
  else if (commas > 1 && dots === 0) {
    cleaned = cleaned.replace(/,/g, "");
  }
  // Case 8: Multiple dots, no commas (1.234.567) → EU thousands
  else if (dots > 1 && commas === 0) {
    cleaned = cleaned.replace(/\./g, "");
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? null : result;
}

/**
 * Extract currency and amount from price text
 * @param {string} text - Text containing price
 * @returns {{amount: number, currency: string|null}}
 */
function extractPriceInfo(text) {
  if (!text) return { amount: null, currency: null };

  // Try each currency pattern
  for (const currency of CURRENCY_PATTERNS) {
    // Try symbol first (e.g., "$29.99", "$29.99 USD", "€24.99")
    const symbolPattern = new RegExp(
      `(${currency.pattern.source})\\s*(\\d+[\\d,.]*\\d*)`,
      "i"
    );
    const symbolMatch = text.match(symbolPattern);
    if (symbolMatch) {
      const amount = parsePrice(symbolMatch[2]);
      if (amount !== null && amount >= 0) {
        return { amount, currency: currency.code };
      }
    }

    // Try code after number (e.g., "29.99 USD", "24.99 EUR")
    const codePattern = new RegExp(
      `(\\d+[\\d,.]*\\d*)\\s*(${currency.pattern.source})`,
      "i"
    );
    const codeMatch = text.match(codePattern);
    if (codeMatch) {
      const amount = parsePrice(codeMatch[1]);
      if (amount !== null && amount >= 0) {
        return { amount, currency: currency.code };
      }
    }
  }

  return { amount: null, currency: null };
}

/**
 * Detect Steam currency by analyzing page prices
 * @returns {Promise<string|null>} - Detected currency code or null
 */
async function detectSteamCurrency() {
  // Use TreeWalker to find first price on page
  const walker = createPriceTreeWalker(document.body);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (text && PRICE_REGEX.test(text)) {
      const priceInfo = extractPriceInfo(text);
      if (priceInfo.currency) {
        return priceInfo.currency;
      }
    }
  }

  // Fallback: Try to detect from meta tags
  const priceMeta = document.querySelector(
    'meta[property="product:price:currency"]'
  );
  if (priceMeta) {
    const currency = priceMeta.getAttribute("content")?.toUpperCase();
    if (currency && CURRENCY_PATTERNS.some((c) => c.code === currency)) {
      return currency;
    }
  }

  return null;
}

/**
 * Get data from storage
 * @returns {Promise<{targetCurrency: string, exchangeRates: object, steamCurrency: string|null}>}
 */
async function getStorageData() {
  // Return default values if context is invalid
  const defaultData = {
    targetCurrency: "USD",
    exchangeRates: { rates: {}, base: "USD" },
    steamCurrency: "USD",
  };

  if (!isContextValid()) {
    return defaultData;
  }

  return safeApiCall(() => {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(
          ["targetCurrency", "exchangeRates", "steamCurrency"],
          async (data) => {
            if (chrome.runtime.lastError) {
              contextValid = false;
              resolve(defaultData);
              return;
            }

            // Detect Steam currency if not stored
            let steamCurrency = data.steamCurrency;
            if (!steamCurrency) {
              steamCurrency = await detectSteamCurrency();
              if (steamCurrency && isContextValid()) {
                try {
                  chrome.storage.local.set({ steamCurrency });
                } catch (e) {
                  // Ignore storage errors - context may be invalid
                }
              }
            }

            const rates = data.exchangeRates?.rates || {};
            const baseCurrency = data.exchangeRates?.base || "USD";

            resolve({
              targetCurrency: data.targetCurrency || "USD",
              exchangeRates: {
                rates,
                base: baseCurrency,
              },
              steamCurrency: steamCurrency || "USD",
            });
          }
        );
      } catch (e) {
        contextValid = false;
        resolve(defaultData);
      }
    });
  }, defaultData);
}

/**
 * Convert price from source currency to target currency
 * @param {number} amount - Price amount
 * @param {string} sourceCurrency - Source currency code
 * @param {string} targetCurrency - Target currency code
 * @param {object} rateData - Exchange rate data {rates: object, base: string}
 * @returns {number|null} - Converted price
 */
function convertCurrency(amount, sourceCurrency, targetCurrency, rateData) {
  if (
    amount === null ||
    amount === undefined ||
    !sourceCurrency ||
    !targetCurrency ||
    !rateData?.rates
  )
    return null;

  // Same currency, no conversion needed
  if (sourceCurrency === targetCurrency) return amount;

  const { rates } = rateData;

  // Both currencies must be in the rate table
  if (!rates[sourceCurrency] || !rates[targetCurrency]) {
    // Missing rates for conversion (will use original price)
    return null;
  }

  // Convert via base currency (USD)
  // Source -> Base -> Target
  const amountInBase = amount / rates[sourceCurrency];
  const convertedAmount = amountInBase * rates[targetCurrency];

  return convertedAmount;
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} - Currency symbol
 */
function getCurrencySymbol(currency) {
  const currencyInfo = CURRENCY_PATTERNS.find((c) => c.code === currency);
  return currencyInfo?.symbols[0] || currency;
}

/**
 * Format price according to currency conventions
 * @param {number} amount - Price amount
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price string
 */
function formatPrice(amount, currency) {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toFixed(2);

  // European format currencies (comma as decimal, dot as thousands)
  // TRY, EUR, and other European currencies
  const europeanFormatCurrencies = [
    "TRY",
    "EUR",
    "PLN",
    "SEK",
    "NOK",
    "DKK",
    "UAH",
    "RUB",
  ];
  if (europeanFormatCurrencies.includes(currency)) {
    const parts = formatted.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${symbol}${integerPart},${parts[1]} ${currency}`;
  }

  // Currencies that don't use decimals (whole numbers only)
  const noDecimalCurrencies = [
    "JPY",
    "KRW",
    "VND",
    "IDR",
    "CLP",
    "COP",
    "KZT",
    "UYU",
  ];
  if (noDecimalCurrencies.includes(currency)) {
    return `${symbol}${Math.round(amount).toLocaleString()} ${currency}`;
  }

  // Most currencies: symbol + amount with 2 decimals + currency code (US format)
  const parts = formatted.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${integerPart}.${parts[1]} ${currency}`;
}

// ==================== TREEWALKER FUNCTIONS ====================

/**
 * Check if an element should be skipped
 * @param {Node} node - DOM node to check
 * @returns {boolean} - True if should skip
 */
function shouldSkipElement(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;

  // Skip by tag name
  if (SKIP_TAGS.has(node.tagName)) return true;

  // Skip hidden elements
  if (node.hidden) return true;

  // Skip elements with display:none or visibility:hidden
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return true;

  return false;
}

/**
 * Check if element content has changed from what we converted it to
 * @param {Element} parent - Parent element to check
 * @returns {boolean} - True if content changed (needs reprocessing)
 */
function hasContentChanged(parent) {
  if (!parent.hasAttribute(PROCESSED_ATTR)) return true;
  if (!parent.hasAttribute(CONVERTED_TEXT_ATTR)) return true;

  const currentText = parent.textContent?.trim();
  const convertedText = parent.getAttribute(CONVERTED_TEXT_ATTR);

  // If current text doesn't match what we converted it to, content changed
  return currentText !== convertedText;
}

/**
 * Create a TreeWalker to find text nodes containing prices
 * @param {Node} root - Root node to start traversal
 * @param {boolean} includeProcessed - Whether to include already processed nodes
 * @returns {TreeWalker}
 */
function createPriceTreeWalker(root, includeProcessed = false) {
  return document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip if parent should be skipped
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        // Skip if inside a skipped tag
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;

        // Skip if parent is already processed (unless content changed or includeProcessed)
        if (!includeProcessed && parent.hasAttribute(PROCESSED_ATTR)) {
          // Check if content has changed (virtual scroll recycling)
          if (!hasContentChanged(parent)) {
            return NodeFilter.FILTER_REJECT;
          }
          // Content changed - clear the processed flag
          parent.removeAttribute(PROCESSED_ATTR);
          parent.removeAttribute(ORIGINAL_TEXT_ATTR);
          parent.removeAttribute(CONVERTED_TEXT_ATTR);
        }

        // Skip empty or whitespace-only text
        const text = node.textContent?.trim();
        if (!text) return NodeFilter.FILTER_REJECT;

        // Skip percentage patterns (like -15%, -20%)
        if (PERCENTAGE_REGEX.test(text)) return NodeFilter.FILTER_REJECT;

        // Accept if text looks like a price
        if (PRICE_REGEX.test(text)) return NodeFilter.FILTER_ACCEPT;

        return NodeFilter.FILTER_REJECT;
      },
    },
    false
  );
}

// ==================== PRICE PROCESSING ====================

/**
 * Process a text node and convert its price
 * @param {Text} textNode - Text node containing price
 * @param {object} storageData - Storage data with currency info
 */
function processTextNode(textNode, storageData) {
  const parent = textNode.parentElement;
  if (!parent) return;

  // Check if content changed on already processed element
  if (parent.hasAttribute(PROCESSED_ATTR) && !hasContentChanged(parent)) {
    return;
  }

  // Clear old attributes if reprocessing
  if (parent.hasAttribute(PROCESSED_ATTR)) {
    parent.removeAttribute(PROCESSED_ATTR);
    parent.removeAttribute(ORIGINAL_TEXT_ATTR);
    parent.removeAttribute(CONVERTED_TEXT_ATTR);
  }

  const text = textNode.textContent?.trim();
  if (!text) return;

  // Skip percentage patterns
  if (PERCENTAGE_REGEX.test(text)) return;

  // Extract price info
  const priceInfo = extractPriceInfo(text);
  if (priceInfo.amount === null || !priceInfo.currency) return;

  // Don't process if currency already matches target
  if (priceInfo.currency === storageData.targetCurrency) {
    parent.setAttribute(PROCESSED_ATTR, "same");
    parent.setAttribute(CONVERTED_TEXT_ATTR, text);
    return;
  }

  // Convert currency
  const convertedAmount = convertCurrency(
    priceInfo.amount,
    priceInfo.currency,
    storageData.targetCurrency,
    storageData.exchangeRates
  );
  if (convertedAmount === null) return;

  // Save original text on parent
  parent.setAttribute(ORIGINAL_TEXT_ATTR, text);

  // Format and replace
  const newPriceText = formatPrice(convertedAmount, storageData.targetCurrency);
  textNode.textContent = newPriceText;

  // Mark parent as processed and store converted text for change detection
  parent.setAttribute(PROCESSED_ATTR, "true");
  parent.setAttribute(CONVERTED_TEXT_ATTR, newPriceText);
}

/**
 * Process all prices on the page using TreeWalker
 */
async function processAllPrices() {
  // Check if context is still valid
  if (!isContextValid()) return;

  // Check if extension is enabled
  if (!extensionEnabled) return;

  // Only run on Steam pages
  const hostname = window.location.hostname;
  if (!hostname.includes("steampowered.com")) return;

  // Get storage data once
  const storageData = await getStorageData();

  // Create TreeWalker and process all price text nodes
  const walker = createPriceTreeWalker(document.body);
  const nodesToProcess = [];

  // Collect nodes first (to avoid issues with live NodeList during modification)
  let node;
  while ((node = walker.nextNode())) {
    nodesToProcess.push(node);
  }

  // Process collected nodes
  for (const textNode of nodesToProcess) {
    processTextNode(textNode, storageData);
  }
}

/**
 * Process prices within a specific subtree (for MutationObserver)
 * @param {Node} root - Root node of subtree to process
 */
async function processPricesInSubtree(root) {
  // Check if context is still valid
  if (!isContextValid()) return;

  // Check if extension is enabled
  if (!extensionEnabled) return;

  if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

  // Skip if root should be skipped
  if (shouldSkipElement(root)) return;

  // Get storage data
  const storageData = await getStorageData();

  // Create TreeWalker for this subtree
  const walker = createPriceTreeWalker(root);
  const nodesToProcess = [];

  let node;
  while ((node = walker.nextNode())) {
    nodesToProcess.push(node);
  }

  for (const textNode of nodesToProcess) {
    processTextNode(textNode, storageData);
  }
}

// ==================== MUTATION OBSERVER ====================

let mutationTimeout = null;
const DEBOUNCE_MS = 300;

/**
 * Setup MutationObserver to watch for new content
 */
function setupMutationObserver() {
  if (!isContextValid()) return null;

  const observer = new MutationObserver((mutations) => {
    // Skip if context invalid or extension disabled
    if (!isContextValid() || !extensionEnabled) return;

    // Collect new nodes to process
    const nodesToProcess = new Set();

    for (const mutation of mutations) {
      // Handle added nodes
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this element or its children might contain prices
            const text = node.textContent || "";
            if (PRICE_REGEX.test(text)) {
              nodesToProcess.add(node);
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (
              text &&
              PRICE_REGEX.test(text) &&
              !PERCENTAGE_REGEX.test(text)
            ) {
              // Add parent element
              if (node.parentElement) {
                nodesToProcess.add(node.parentElement);
              }
            }
          }
        }
      }

      // Handle text content changes (important for virtual scrolling!)
      if (mutation.type === "characterData") {
        const text = mutation.target.textContent?.trim();
        if (text && PRICE_REGEX.test(text) && !PERCENTAGE_REGEX.test(text)) {
          const parent = mutation.target.parentElement;
          if (parent) {
            // Always add for reprocessing - content changed
            nodesToProcess.add(parent);
          }
        }
      }

      // Handle childList changes where content might be swapped
      if (
        mutation.type === "childList" &&
        mutation.target.nodeType === Node.ELEMENT_NODE
      ) {
        const text = mutation.target.textContent || "";
        if (PRICE_REGEX.test(text)) {
          // Check if this element was previously processed but content changed
          if (mutation.target.hasAttribute(PROCESSED_ATTR)) {
            if (hasContentChanged(mutation.target)) {
              nodesToProcess.add(mutation.target);
            }
          }
        }
      }
    }

    // Process new nodes with debounce
    if (nodesToProcess.size > 0) {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(async () => {
        // Check context validity before processing
        if (!isContextValid()) return;

        for (const node of nodesToProcess) {
          // Clear processed flag for nodes that need reprocessing
          if (node.hasAttribute && node.hasAttribute(PROCESSED_ATTR)) {
            if (hasContentChanged(node)) {
              node.removeAttribute(PROCESSED_ATTR);
              node.removeAttribute(ORIGINAL_TEXT_ATTR);
              node.removeAttribute(CONVERTED_TEXT_ATTR);
            }
          }
          await processPricesInSubtree(node);
        }
      }, DEBOUNCE_MS);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}

// ==================== STORAGE LISTENER ====================

/**
 * Clear all processed markers and restore original text
 */
function clearAllProcessedMarkers() {
  document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => {
    el.removeAttribute(PROCESSED_ATTR);
    el.removeAttribute(CONVERTED_TEXT_ATTR);
    const originalText = el.getAttribute(ORIGINAL_TEXT_ATTR);
    if (originalText) {
      el.textContent = originalText;
    }
    el.removeAttribute(ORIGINAL_TEXT_ATTR);
  });
}

/**
 * Setup storage listener for currency/rate changes and extension toggle
 */
function setupStorageListener() {
  if (!isContextValid()) return;

  try {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      // Check context validity on each event
      if (!isContextValid()) return;

      if (namespace === "local") {
        // Handle extension enable/disable
        if (changes.extensionEnabled !== undefined) {
          extensionEnabled = changes.extensionEnabled.newValue !== false;

          if (extensionEnabled) {
            // Re-process all prices when enabled
            setTimeout(() => {
              if (isContextValid()) processAllPrices();
            }, 100);
          } else {
            // Restore original prices when disabled
            clearAllProcessedMarkers();
          }
          return;
        }

        // Handle currency/rate changes
        if (changes.targetCurrency || changes.exchangeRates) {
          // Clear processed markers and restore original text
          clearAllProcessedMarkers();

          // Re-process all prices
          setTimeout(() => {
            if (isContextValid()) processAllPrices();
          }, 100);
        }
      }
    });
  } catch (e) {
    contextValid = false;
  }
}

// ==================== MESSAGE LISTENER ====================

/**
 * Listen for messages from popup
 */
function setupMessageListener() {
  if (!isContextValid()) return;

  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // Check context validity
      if (!isContextValid()) {
        return false;
      }

      if (request.action === "targetCurrencyChanged") {
        // Clear and reprocess
        clearAllProcessedMarkers();

        setTimeout(() => {
          if (isContextValid()) processAllPrices();
        }, 100);

        sendResponse({ success: true });
      }

      if (request.action === "extensionToggled") {
        extensionEnabled = request.enabled;

        if (extensionEnabled) {
          setTimeout(() => {
            if (isContextValid()) processAllPrices();
          }, 100);
        } else {
          clearAllProcessedMarkers();
        }

        sendResponse({ success: true });
      }

      return true;
    });
  } catch (e) {
    contextValid = false;
  }
}

// ==================== URL CHANGE DETECTION ====================

/**
 * Setup URL change detection for SPA navigation
 */
function setupUrlChangeDetection() {
  if (!isContextValid()) return;

  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    // Skip if context is invalid
    if (!isContextValid()) return;

    if (location.href !== lastUrl) {
      lastUrl = location.href;

      // Clear all markers and original text attributes
      document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => {
        el.removeAttribute(PROCESSED_ATTR);
        el.removeAttribute(ORIGINAL_TEXT_ATTR);
        el.removeAttribute(CONVERTED_TEXT_ATTR);
      });

      // Re-process after navigation
      setTimeout(() => {
        if (isContextValid()) processAllPrices();
      }, 500);
    }
  });

  observer.observe(document, { subtree: true, childList: true });
}

// ==================== PERIODIC CHECK FOR VIRTUAL SCROLL ====================

/**
 * Setup periodic check for virtual scrolling content
 * This catches elements that were recycled without proper mutation events
 */
function setupPeriodicCheck() {
  const intervalId = setInterval(async () => {
    // Stop periodic check if context is invalid
    if (!isContextValid()) {
      clearInterval(intervalId);
      return;
    }

    if (!extensionEnabled) return;

    const hostname = window.location.hostname;
    if (!hostname.includes("steampowered.com")) return;

    const storageData = await getStorageData();

    // Check all processed elements for content changes
    const processedElements = document.querySelectorAll(`[${PROCESSED_ATTR}]`);

    for (const el of processedElements) {
      if (hasContentChanged(el)) {
        // Content changed - clear and reprocess
        el.removeAttribute(PROCESSED_ATTR);
        el.removeAttribute(ORIGINAL_TEXT_ATTR);
        el.removeAttribute(CONVERTED_TEXT_ATTR);

        // Find text nodes in this element and process
        const walker = createPriceTreeWalker(el);
        let node;
        while ((node = walker.nextNode())) {
          processTextNode(node, storageData);
        }
      }
    }

    // Also look for any unprocessed prices
    const walker = createPriceTreeWalker(document.body);
    const nodesToProcess = [];
    let node;
    while ((node = walker.nextNode())) {
      nodesToProcess.push(node);
    }

    if (nodesToProcess.length > 0) {
      for (const textNode of nodesToProcess) {
        processTextNode(textNode, storageData);
      }
    }
  }, 1000); // Check every second for smoother scrolling experience
}

// ==================== INITIALIZATION ====================

/**
 * Initialize the extension
 */
async function init() {
  // Check if context is valid before initialization
  if (!isContextValid()) {
    return;
  }

  // Check if extension is enabled
  extensionEnabled = await isExtensionEnabled();

  if (!extensionEnabled) {
    // Extension disabled
    // Still setup listeners to react to enable
    setupStorageListener();
    setupMessageListener();
    return;
  }

  // Extension active (Steam) - Regex-based detection

  // Initial processing
  await processAllPrices();

  // Setup observers and listeners
  setupMutationObserver();
  setupStorageListener();
  setupMessageListener();
  setupUrlChangeDetection();
  setupPeriodicCheck();

  // Re-process after a delay (for late-loading content)
  setTimeout(() => {
    if (isContextValid()) processAllPrices();
  }, 2000);
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
