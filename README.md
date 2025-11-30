# Currency Converter for Steam

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/cemozay/currency-converter-for-steam)

A free, open-source Chrome extension that automatically converts Steam game prices to any currency. No API keys required, works entirely offline after initial setup.

## ✨ Features

- 🌍 **170+ Supported Currencies** - Convert to any currency worldwide
- 🔄 **Automatic Detection** - Detects Steam's regional currency automatically
- ⚡ **Real-time Conversion** - Prices update instantly as you browse
- 🎨 **Clean Interface** - Direct price replacement, no intrusive badges
- 🌐 **Multi-language Support** - English and Turkish
- 📊 **Daily Updates** - Exchange rates update automatically
- 🔒 **Privacy First** - No data collection, all processing happens locally
- 💰 **Free API** - Uses exchangerate-api.com (no API key required)
- 🚀 **Lightweight** - Only ~82 KB total size
- ✅ **Manifest V3** - Compatible with latest Chrome standards

## 📸 Screenshots

![Screenshot 1](screenshots/screenshot-1.png)
![Screenshot 2](screenshots/screenshot-2.png)
![Screenshot 3](screenshots/screenshot-3.png)

## 🚀 Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Click "Add to Chrome"
3. Confirm installation
4. Visit any Steam store page to see converted prices!

### Manual Installation (Development)

1. Clone this repository:

   ```bash
   git clone https://github.com/cemozay/currency-converter-for-steam.git
   cd currency-converter-for-steam
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the project directory

6. The extension is now installed!

## 📖 How It Works

1. **Visit Steam Store** - Navigate to any Steam store page
2. **Automatic Detection** - Extension detects Steam's regional currency
3. **Price Conversion** - Prices are converted to your selected target currency
4. **Direct Replacement** - Original prices are replaced with converted values

### Supported Steam Currencies

The extension supports all 37 Steam-supported currencies:

**Major:** USD, EUR, GBP, JPY, CNY  
**Americas:** BRL, CAD, MXN, CLP, COP, CRC, PEN, UYU  
**Europe:** TRY, RUB, PLN, UAH, CHF, SEK, NOK, DKK  
**Asia Pacific:** AUD, NZD, SGD, HKD, TWD, KRW, INR, IDR, MYR, PHP, THB, VND, KZT  
**Middle East:** AED, SAR, QAR, KWD, ILS  
**Africa:** ZAR

## 🎯 Usage

1. **Select Target Currency**

   - Click the extension icon
   - Choose your preferred currency from the dropdown
   - Prices will update automatically

2. **View Exchange Rates**

   - Extension popup shows current exchange rates
   - Steam currency is automatically detected
   - Conversion rate displayed (e.g., "1 USD = 30.00 TRY")

3. **Refresh Rates**

   - Click the refresh button to update exchange rates manually
   - Rates update automatically once per day

4. **Toggle Extension**
   - Use the toggle switch to enable/disable the extension
   - When disabled, original prices are restored

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Areas for Contribution

- Additional language translations
- Performance optimizations
- Bug fixes
- Feature suggestions
- Documentation improvements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/cemozay/currency-converter-for-steam/issues)
- **Discussions:** [GitHub Discussions](https://github.com/cemozay/currency-converter-for-steam/discussions)

## 🔒 Privacy

This extension:

- ✅ Does NOT collect any personal data
- ✅ Does NOT track user behavior
- ✅ Does NOT transmit data to third parties
- ✅ Processes all data locally
- ✅ Only fetches public exchange rate data

All exchange rates are cached locally and only updated when necessary.

---

**Made with ❤️ for the Steam community**
