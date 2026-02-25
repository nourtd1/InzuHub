import { describe, test, expect } from '@jest/globals';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import rw from '../locales/rw.json';
import sw from '../locales/sw.json';

function getAllKeys(obj: any, prefix = ''): string[] {
    return Object.keys(obj).flatMap(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        return typeof obj[key] === 'object' && !Array.isArray(obj[key])
            ? getAllKeys(obj[key], fullKey)
            : [fullKey];
    });
}

const frKeys = getAllKeys(fr);

describe('Translations completeness', () => {
    ['en', 'rw', 'sw'].forEach(lang => {
        const translations = { en, rw, sw }[lang as 'en' | 'rw' | 'sw'] as any;
        const langKeys = getAllKeys(translations);

        test(`${lang} has all FR keys`, () => {
            frKeys.forEach(key => {
                expect(langKeys).toContain(key);
            });
        });
    });
});
