import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'

import fr from './locales/fr.json'
import en from './locales/en.json'
import rw from './locales/rw.json'
import sw from './locales/sw.json'

// Note : Toutes les langues supportées (fr, en, rw, sw) 
// sont Left-to-Right. Pas de configuration RTL nécessaire.

export const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', nativeLabel: 'Français' },
    { code: 'en', label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼', nativeLabel: 'Kinyarwanda' },
    { code: 'sw', label: 'Kiswahili', flag: '🌍', nativeLabel: 'Kiswahili' },
]

export type LanguageCode = 'fr' | 'en' | 'rw' | 'sw'

const LANGUAGE_KEY = 'inzuhub_language'

// Détecter la langue du système et mapper vers nos langues supportées
function getDeviceLanguage(): LanguageCode {
    const locale = Localization.getLocales()[0]?.languageCode ?? 'fr'
    if (locale === 'rw') return 'rw'
    if (locale === 'sw' || locale === 'swh') return 'sw'
    if (locale === 'en') return 'en'
    return 'fr' // Défaut : français
}

// Charger la langue persistée ou détecter automatiquement
export async function loadSavedLanguage(): Promise<LanguageCode> {
    try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY)
        if (saved && ['fr', 'en', 'rw', 'sw'].includes(saved)) {
            return saved as LanguageCode
        }
    } catch { }
    return getDeviceLanguage()
}

// Changer et persister la langue
export async function changeLanguage(code: LanguageCode): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_KEY, code)
    await i18n.changeLanguage(code)
}

// Initialisation i18next
i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources: {
        fr: { translation: fr },
        en: { translation: en },
        rw: { translation: rw },
        sw: { translation: sw },
    },
    lng: 'fr',                    // langue initiale (sera remplacée au chargement)
    fallbackLng: 'fr',            // si clé manquante → français
    interpolation: {
        escapeValue: false,          // React gère le XSS
    },
})

export default i18n
