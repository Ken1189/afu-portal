import { describe, it, expect } from 'vitest';
import { getTranslations, localeNames, localeFlags, type Locale } from '@/lib/i18n/translations';

const ALL_LOCALES: Locale[] = ['en', 'sn', 'nd', 'sw', 'tn', 'pt', 'ha', 'yo', 'zu', 'af', 'bem', 'kri'];

describe('Translations', () => {
  it('has all 12 locales defined in localeNames', () => {
    expect(Object.keys(localeNames)).toHaveLength(12);
    for (const locale of ALL_LOCALES) {
      expect(localeNames[locale]).toBeDefined();
      expect(localeNames[locale].length).toBeGreaterThan(0);
    }
  });

  it('has all 12 locales defined in localeFlags', () => {
    expect(Object.keys(localeFlags)).toHaveLength(12);
    for (const locale of ALL_LOCALES) {
      expect(localeFlags[locale]).toBeDefined();
    }
  });

  it('returns valid translations for all locales', () => {
    for (const locale of ALL_LOCALES) {
      const t = getTranslations(locale);
      expect(t).toBeDefined();
      expect(t.common).toBeDefined();
      expect(t.common.home).toBeDefined();
      expect(t.common.home.length).toBeGreaterThan(0);
      expect(t.dashboard).toBeDefined();
      expect(t.dashboard.greeting).toBeDefined();
    }
  });

  it('English has all sections filled', () => {
    const t = getTranslations('en');
    expect(t.common.home).toBe('Home');
    expect(t.dashboard.greeting).toBe('Welcome back');
    expect(t.cropTracker.title).toBe('My Crops');
    expect(t.cropDoctor.title).toBe('Crop Doctor');
    expect(t.moneyTracker.title).toBe('Money Tracker');
    expect(t.farmJournal.title).toBe('Farm Journal');
    expect(t.financing.title).toBe('Financing');
    expect(t.insurance.title).toBe('Farm Insurance');
    expect(t.aiAssistant.title).toBe('Mkulima AI');
  });

  it('Swahili common translations are in Kiswahili', () => {
    const t = getTranslations('sw');
    expect(t.common.home).toBe('Nyumbani');
    expect(t.common.crops).toBe('Mazao');
    expect(t.common.money).toBe('Fedha');
  });

  it('Portuguese common translations are in Portuguese', () => {
    const t = getTranslations('pt');
    expect(t.common.home).toBe('Início');
    expect(t.common.crops).toBe('Culturas');
  });

  it('Afrikaans common translations are in Afrikaans', () => {
    const t = getTranslations('af');
    expect(t.common.home).toBe('Tuis');
    expect(t.common.crops).toBe('Gewasse');
  });

  it('falls back to English for unknown locale', () => {
    const t = getTranslations('xx' as Locale);
    expect(t.common.home).toBe('Home');
  });
});
