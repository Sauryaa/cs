class TranslationModel {
    constructor() {
        this.countries = [];
        this.translations = new Map();
        this.weatherData = new Map();
        this.searchHistory = this.loadSearchHistory();
        this.currentSearch = null;
        this.apiKey = this.loadApiKey(); 
        this.apiStatus = 'unknown';
        this.weatherApiKey = this.loadWeatherApiKey();
        this.weatherApiStatus = 'unknown';
    }

    async loadCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,languages,translations,flags');
            const data = await response.json();
            
            this.countries = data.map(country => ({
                name: country.name.common,
                code: country.cca2,
                code3: country.cca3,
                languages: country.languages ? Object.values(country.languages) : ['English'],
                primaryLanguage: this.selectBestLanguage(country.languages, country.cca2),
                flagUrl: country.flags ? (country.flags.svg || country.flags.png) : null,
                flagAlt: country.flags ? country.flags.alt : `Flag of ${country.name.common}`
            }));
            
            return this.countries;
        } catch (error) {
            console.error('Error loading these countries data:', error);
            throw error;
        }
    }

    selectBestLanguage(languages, countryCode) {
        if (!languages) return 'en';
        
        const langCodes = Object.keys(languages);
        
        const countryPreferences = {
            'TZ': ['sw', 'swa', 'en', 'eng'], 
            'AR': ['es', 'spa'],
            'PY': ['es', 'spa'],  
            'BO': ['es', 'spa'], 
            'PE': ['es', 'spa'], 
            'EC': ['es', 'spa'], 
            'GT': ['es', 'spa'], 
            'CH': ['de', 'deu', 'fr', 'fra'], 
            'BE': ['nl', 'nld', 'fr', 'fra'],
            'CA': ['en', 'eng', 'fr', 'fra'], 
            'ZA': ['en', 'eng'], 
            'IN': ['hi', 'hin', 'en', 'eng'], 
            'PK': ['ur', 'urd', 'en', 'eng'], 
            'AF': ['fa', 'fas', 'ps', 'pus'], 
            'IR': ['fa', 'fas'], 
            'IQ': ['ar', 'ara'], 
            'SY': ['ar', 'ara'], 
            'LB': ['ar', 'ara'], 
            'EG': ['ar', 'ara'], 
            'MA': ['ar', 'ara'], 
            'DZ': ['ar', 'ara'], 
        };
        
        if (countryPreferences[countryCode]) {
            for (const preferred of countryPreferences[countryCode]) {
                const found = langCodes.find(code => this.mapLanguageCode(code) === preferred);
                if (found) {
                    return preferred;
                }
            }
        }
        
        const supportedLanguages = [
            'en', 'eng', 
            'es', 'spa',  
            'fr', 'fra', 
            'de', 'deu', 
            'it', 'ita', 
            'pt', 'por', 
            'ru', 'rus', 
            'zh', 'zho', 'cmn', 
            'ja', 'jpn', 
            'ko', 'kor', 
            'ar', 'ara', 
            'hi', 'hin', 
            'nl', 'nld', 
            'sv', 'swe',
            'no', 'nor', 
            'da', 'dan', 
            'fi', 'fin', 
            'pl', 'pol', 
            'tr', 'tur',
            'he', 'heb', 
            'th', 'tha', 
            'vi', 'vie',
        ];
        
        for (const supported of supportedLanguages) {
            const found = langCodes.find(code => this.mapLanguageCode(code) === this.mapLanguageCode(supported));
            if (found) {
                return this.mapLanguageCode(found);
            }
        }
        
        const firstLang = this.mapLanguageCode(langCodes[0]);
        return firstLang || 'en';
    }

    mapLanguageCode(code) {
        if (!code) return 'en';
        
        const languageMap = {
            'ara': 'ar', 'ben': 'bn', 'bul': 'bg', 'cat': 'ca', 'ces': 'cs', 'swa': 'sw', 
            'swh': 'sw', 'dan': 'da', 'deu': 'de', 'ell': 'el', 'eng': 'en', 'spa': 'es',
            'est': 'et', 'fin': 'fi', 'fra': 'fr', 'guj': 'gu', 'heb': 'he',
            'hin': 'hi', 'hrv': 'hr', 'hun': 'hu', 'ind': 'id', 'ita': 'it',
            'jpn': 'ja', 'kor': 'ko', 'lit': 'lt', 'lav': 'lv', 'mkd': 'mk',
            'msa': 'ms', 'mlt': 'mt', 'nld': 'nl', 'nor': 'no', 'pol': 'pl',
            'por': 'pt', 'ron': 'ro', 'rus': 'ru', 'slk': 'sk', 'slv': 'sl',
            'srp': 'sr', 'swe': 'sv', 'tam': 'ta', 'tel': 'te', 'tha': 'th',
            'tur': 'tr', 'ukr': 'uk', 'urd': 'ur', 'vie': 'vi', 'zho': 'zh',
            'cmn': 'zh', 'fas': 'fa', 'per': 'fa', 'pus': 'ps',
            
            'grn': 'es',
            'que': 'es',
            'aym': 'es',
            'ber': 'ar',
            'amh': 'en',
            'orm': 'en',
            'hau': 'en',
            'yor': 'en',
            'ibo': 'en',
            'swa': 'en',
            'mlg': 'fr',
            'nya': 'en',
            'sna': 'en',
            'som': 'ar',
            'tir': 'ar',
            'kin': 'en',
            'run': 'en',
            'lug': 'en',
            'div': 'ar',
            'dzo': 'en',
            'tuk': 'ru',
            'uzb': 'ru',
            'kaz': 'ru',
            'kir': 'ru',
            'tgk': 'ru',
            'mon': 'ru',
            'lao': 'th',
            'khm': 'th',
            'mya': 'th',
            'sin': 'hi',
            'nep': 'hi',
            'ben': 'hi',
            'tam': 'hi',
            'tel': 'hi',
            'kan': 'hi',
            'mal': 'hi',
            'pan': 'hi',
            'guj': 'hi',
            'ori': 'hi',
            'asm': 'hi',
            'mar': 'hi'

        };
        
        const lowerCode = code.toLowerCase();
        
        return languageMap[lowerCode] || (lowerCode.length === 2 ? lowerCode : 'en');
    }

    loadApiKey() {
        try {
            const savedKey = localStorage.getItem('googleTranslateApiKey');
            if (savedKey && savedKey !== 'api' && savedKey.trim() !== '') {
                return savedKey;
            }
        } catch (error) {
            console.warn('Could not load API key from localStorage:', error);
        }
        return null;
    }

    loadWeatherApiKey() {
        try {
            const savedKey = localStorage.getItem('openWeatherApiKey');
            if (savedKey && savedKey !== 'api' && savedKey.trim() !== '') {
                return savedKey;
            }
        } catch (error) {
            console.warn('Could not load weather API key from localStorage:', error);
        }
        return null;
    }

    saveApiKey(apiKey) {
        try {
            if (apiKey && apiKey.trim() !== '') {
                localStorage.setItem('googleTranslateApiKey', apiKey.trim());
                this.apiKey = apiKey.trim();
                this.apiStatus = 'unknown'; 
                return true;
            }
        } catch (error) {
            console.error('Could not save API key:', error);
        }
        return false;
    }

    saveWeatherApiKey(apiKey) {
        try {
            if (apiKey && apiKey.trim() !== '') {
                localStorage.setItem('openWeatherApiKey', apiKey.trim());
                this.weatherApiKey = apiKey.trim();
                this.weatherApiStatus = 'unknown';
                return true;
            }
        } catch (error) {
            console.error('Could not save weather API key:', error);
        }
        return false;
    }

    async testApiKey(apiKey = null) {
        const keyToTest = apiKey || this.apiKey;
        if (!keyToTest) {
            this.apiStatus = 'invalid';
            return false;
        }

        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${keyToTest}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: 'test',
                    target: 'es',
                    source: 'en',
                    format: 'text'
                })
            });

            if (response.ok) {
                this.apiStatus = 'valid';
                if (apiKey) {
                    this.apiKey = apiKey;
                    this.saveApiKey(apiKey);
                }
                return true;
            } else {
                this.apiStatus = 'invalid';
                return false;
            }
        } catch (error) {
            console.warn('API key test failed:', error);
            this.apiStatus = 'error';
            return false;
        }
    }

    async testWeatherApiKey(apiKey = null) {
        const keyToTest = apiKey || this.weatherApiKey;
        if (!keyToTest) {
            this.weatherApiStatus = 'invalid';
            return false;
        }

        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=${keyToTest}&units=metric`);
            
            if (response.ok) {
                this.weatherApiStatus = 'valid';
                if (apiKey) {
                    this.weatherApiKey = apiKey;
                    this.saveWeatherApiKey(apiKey);
                }
                return true;
            } else {
                this.weatherApiStatus = 'invalid';
                return false;
            }
        } catch (error) {
            console.warn('Weather API key test failed:', error);
            this.weatherApiStatus = 'error';
            return false;
        }
    }

    async fetchWeatherForCountry(countryCode) {
        if (!this.weatherApiKey || this.weatherApiStatus !== 'valid') {
            return null;
        }

        try {
            const country = this.countries.find(c => c.code === countryCode);
            if (!country) return null;

            const countryCoordinates = this.getCountryCoordinates(countryCode);
            if (!countryCoordinates) return null;

            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${countryCoordinates.lat}&lon=${countryCoordinates.lon}&appid=${this.weatherApiKey}&units=metric`
            );

            if (!response.ok) {
                throw new Error(`Weather API request failed: ${response.status}`);
            }

            const data = await response.json();
            return {
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed
            };
        } catch (error) {
            console.warn(`Weather fetch failed for ${countryCode}:`, error);
            return null;
        }
    }

    getCountryCoordinates(countryCode) {
        const coordinates = {
            'US': { lat: 38.9072, lon: -77.0369 },
            'GB': { lat: 51.5074, lon: -0.1278 },
            'FR': { lat: 48.8566, lon: 2.3522 },
            'DE': { lat: 52.5200, lon: 13.4050 },
            'IT': { lat: 41.9028, lon: 12.4964 },
            'ES': { lat: 40.4168, lon: -3.7038 },
            'CA': { lat: 45.4215, lon: -75.6972 },
            'AU': { lat: -35.2809, lon: 149.1300 },
            'JP': { lat: 35.6762, lon: 139.6503 },
            'CN': { lat: 39.9042, lon: 116.4074 },
            'IN': { lat: 28.6139, lon: 77.2090 },
            'BR': { lat: -15.7801, lon: -47.9292 },
            'RU': { lat: 55.7558, lon: 37.6176 },
            'MX': { lat: 19.4326, lon: -99.1332 },
            'AR': { lat: -34.6118, lon: -58.3960 },
            'ZA': { lat: -25.7479, lon: 28.2293 },
            'EG': { lat: 30.0444, lon: 31.2357 },
            'NG': { lat: 9.0765, lon: 7.3986 },
            'KE': { lat: -1.2921, lon: 36.8219 },
            'MA': { lat: 33.9716, lon: -6.8498 },
            'TR': { lat: 39.9334, lon: 32.8597 },
            'SA': { lat: 24.7136, lon: 46.6753 },
            'IR': { lat: 35.6892, lon: 51.3890 },
            'PK': { lat: 33.6844, lon: 73.0479 },
            'BD': { lat: 23.8103, lon: 90.4125 },
            'TH': { lat: 13.7563, lon: 100.5018 },
            'VN': { lat: 21.0285, lon: 105.8542 },
            'ID': { lat: -6.2088, lon: 106.8456 },
            'PH': { lat: 14.5995, lon: 120.9842 },
            'KR': { lat: 37.5665, lon: 126.9780 },
            'NL': { lat: 52.3676, lon: 4.9041 },
            'BE': { lat: 50.8503, lon: 4.3517 },
            'CH': { lat: 46.9481, lon: 7.4474 },
            'AT': { lat: 48.2082, lon: 16.3738 },
            'SE': { lat: 59.3293, lon: 18.0686 },
            'NO': { lat: 59.9139, lon: 10.7522 },
            'DK': { lat: 55.6761, lon: 12.5683 },
            'FI': { lat: 60.1699, lon: 24.9384 },
            'PL': { lat: 52.2297, lon: 21.0122 },
            'CZ': { lat: 50.0755, lon: 14.4378 },
            'HU': { lat: 47.4979, lon: 19.0402 },
            'RO': { lat: 44.4268, lon: 26.1025 },
            'BG': { lat: 42.6977, lon: 23.3219 },
            'GR': { lat: 37.9838, lon: 23.7275 },
            'PT': { lat: 38.7223, lon: -9.1393 },
            'IE': { lat: 53.3498, lon: -6.2603 },
            'NZ': { lat: -41.2865, lon: 174.7762 },
            'CL': { lat: -33.4489, lon: -70.6693 },
            'CO': { lat: 4.7110, lon: -74.0721 },
            'PE': { lat: -12.0464, lon: -77.0428 },
            'VE': { lat: 10.4806, lon: -66.9036 },
            'UY': { lat: -34.9011, lon: -56.1645 },
            'PY': { lat: -25.2637, lon: -57.5759 },
            'BO': { lat: -16.2902, lon: -63.5887 },
            'EC': { lat: -0.1807, lon: -78.4678 },
            'GT': { lat: 14.6349, lon: -90.5069 },
            'CU': { lat: 23.1136, lon: -82.3666 },
            'JM': { lat: 18.1096, lon: -77.2975 },
            'HT': { lat: 18.5944, lon: -72.3074 },
            'DO': { lat: 18.4861, lon: -69.9312 },
            'PA': { lat: 8.5380, lon: -80.7821 },
            'CR': { lat: 9.9281, lon: -84.0907 },
            'NI': { lat: 12.2650, lon: -85.2072 },
            'HN': { lat: 14.0723, lon: -87.1921 },
            'SV': { lat: 13.7942, lon: -88.8965 },
            'BZ': { lat: 17.1899, lon: -88.4976 }
        };

        return coordinates[countryCode] || null;
    }

    async translateText(text, targetLang, sourceLang = 'auto') {
        try {
            if (this.apiKey && this.apiStatus === 'valid') {
                const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: text,
                        target: targetLang,
                        source: sourceLang === 'auto' ? undefined : sourceLang,
                        format: 'text'
                    })
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        this.apiStatus = 'invalid';
                        throw new Error('Invalid API key or insufficient permissions');
                    } else if (response.status === 429) {
                        throw new Error('API quota exceeded. Please try again later.');
                    } else {
                        throw new Error(`Translation API request failed: ${response.status}`);
                    }
                }

                const data = await response.json();
                return data.data.translations[0].translatedText;
            } else if (this.apiKey && this.apiStatus === 'unknown') {
                const isValid = await this.testApiKey();
                if (isValid) {
                    return await this.translateText(text, targetLang, sourceLang);
                } else {
                    throw new Error('Invalid API key. Please check your Google Cloud Translation API key.');
                }
            } else {
                return `[${targetLang.toUpperCase()}] ${text}`;
            }
        } catch (error) {
            console.warn('Translation API failed:', error);
            throw error; 
        }
    }

    async translateForAllCountries(text, sourceLang = 'auto') {
        const translations = new Map();
        const weatherData = new Map();
        const uniqueLanguages = new Set();
        const failedTranslations = [];
        
        this.countries.forEach(country => {
            uniqueLanguages.add(country.primaryLanguage);
        });

        for (const lang of uniqueLanguages) {
            if (lang !== sourceLang) {
                try {
                    const translation = await this.translateText(text, lang, sourceLang);
                    translations.set(lang, translation);
                } catch (error) {
                    console.error(`Translation failed for language ${lang}:`, error);
                    translations.set(lang, text); 
                    failedTranslations.push({ language: lang, error: error.message });
                }
            } else {
                translations.set(lang, text);
            }
        }

        const weatherPromises = this.countries.map(async (country) => {
            try {
                const weather = await this.fetchWeatherForCountry(country.code);
                if (weather) {
                    weatherData.set(country.code, weather);
                }
            } catch (error) {
                console.warn(`Weather fetch failed for ${country.name}:`, error);
            }
        });

        await Promise.all(weatherPromises);

        this.translations = translations;
        this.weatherData = weatherData;
        
        if (failedTranslations.length > 0) {
            this.lastFailedTranslations = failedTranslations;
        }
        
        return translations;
    }

    getCountryTranslation(countryCode) {
        const country = this.countries.find(c => c.code === countryCode);
        if (!country) return null;

        const translation = this.translations.get(country.primaryLanguage);
        const weather = this.weatherData.get(countryCode);
        
        return {
            country: country.name,
            translation: translation || this.currentSearch,
            originalText: this.currentSearch,
            language: country.primaryLanguage,
            languages: country.languages,
            weather: weather
        };
    }

    saveSearch(text, sourceLang) {
        const search = {
            text,
            sourceLang,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        this.searchHistory.unshift(search);
        
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }

        this.saveSearchHistory();
        this.currentSearch = text;
        return search;
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('translationHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('translationHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    deleteSearch(searchId) {
        this.searchHistory = this.searchHistory.filter(search => search.id != searchId);
        this.saveSearchHistory();
        return this.searchHistory;
    }

    clearSearchHistory() {
        this.searchHistory = [];
        try {
            localStorage.removeItem('translationHistory');
        } catch (error) {
            console.error('Error clearing search history:', error);
        }
    }

    getApiStatus() {
        return {
            status: this.apiStatus,
            hasKey: !!this.apiKey,
            keyPreview: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'None'
        };
    }

    getStats() {
        return {
            countriesCount: this.countries.length,
            translationsCount: this.translations.size,
            weatherDataCount: this.weatherData.size,
            searchHistoryCount: this.searchHistory.length,
            apiStatus: this.getApiStatus(),
            weatherApiStatus: this.getWeatherApiStatus()
        };
    }

    getWeatherApiStatus() {
        return {
            status: this.weatherApiStatus,
            hasKey: !!this.weatherApiKey,
            keyPreview: this.weatherApiKey ? `${this.weatherApiKey.substring(0, 8)}...` : 'None'
        };
    }
}
