import { Injectable } from '@angular/core';
import { LuigiCoreService } from './luigiCore.service';
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  // TODO: configurable in service
  fallbackLanguage: string = 'en';
  translationTable = {};
  currentLanguage: string;

  constructor(private luigiCoreService: LuigiCoreService) {
    this.currentLanguage = ''
  }

  afterInit() {
    this.currentLanguage = this.luigiCoreService.i18n().getCurrentLocale();
    this.luigiCoreService.i18n().addCurrentLocaleChangeListener((locale: string) => {
      this.currentLanguage = locale;
    });
  }

  /**
   * get translation synchronously. If nothing is found for current locale try to get tranlsation for fallback language
   *
   * @param key search key
   * @param interpolations in translation table
   * @param locale
   * @returns returns translated search key or search key, if nothing matched
   */
  getTranslation(
    key: string,
    interpolations?: Record<string, string>,
    locale?: string
  ) {
    let result = this.getInternalTranslation(key, interpolations, locale);
    // fallback language
    if (!result) {
      result = this.findTranslation(
        key,
        this.translationTable,
        this.fallbackLanguage,
        interpolations
      );
    }
    return result ? result : key;
  }

  /**
   * Get translation asynchronously (especially for logout and theming translation in user settings dialog).
   * If nothing is found for current locale try to get tranlsation for fallback language
   *
   * @param key search key
   * @param interpolations in translation table
   * @param locale
   * @returns returns translated search key or search key, if nothing matched
   */
  async getTranslationAsync(
    key: string,
    interpolations?: Record<string, string>,
    locale?: string
  ): Promise<string> {
    return new Promise((res) => {
      let result = this.getInternalTranslation(key, interpolations, locale);
      // fallback language
      if (!result) {
        // @ts-ignore
        if (this.translationTable && !this.translationTable[this.fallbackLanguage]) {
          this.fetchTranslationFile(this.fallbackLanguage).then(() => {
            result = this.findTranslation(
              key,
              this.translationTable,
              this.fallbackLanguage,
              interpolations
            );
            res(result ? result : key);
          });
        } else {
          result = this.findTranslation(
            key,
            this.translationTable,
            this.currentLanguage,
            interpolations
          );
          res(result ? result : key);
        }
      } else {
        res(result ? result : key);
      }
    });
  }

  /**
   * Finds the translated value based on given key.
   *
   * @param key key to be translated
   * @param translationTable translation table
   * @param locale current language
   * @param interpolations in translation table
   * @returns translation value
   */
  findTranslation(
    key: string,
    translationTable: any,
    locale: string,
    interpolations?: Record<string, string>
  ) {
    if (translationTable[locale]) {
      const translation =
        typeof translationTable[locale][key] === 'object'
          ? translationTable[locale][key].join('<br>')
          : translationTable[locale][key];
      if (interpolations) {
        return this.findInterpolations(translation, interpolations);
      }
      return translation;
    }
  }

  /**
   * Replaces values that are defined in translation strings
   *
   * @param value to be translated
   * @param interpolations in translation table
   * @returns interpolation
   * @example
   * findInterpolations('Environment {num}', {num: 1})
   */
  findInterpolations(value: string, interpolations: Record<string, string>) {
    if (value) {
      Object.keys(interpolations).forEach((item) => {
        value = value.replace(
          new RegExp('{' + item + '}', 'gi'),
          interpolations[item]
        );
      });
      return value;
    }
    return undefined;
  }

  /**
   * wraps fetched translation table to a specific locale
   *
   * @param locale current language
   * @param data translation json object for specific locale
   */
  addTranslationFile(locale: string, data: Record<string, string>) {
    if (data && locale) {
      // @ts-ignore
      this.translationTable[locale] = data;
    }
  }

  /**
   * fetch generated translation json files
   *
   * @param locale current language
   * @returns translationTable for a specific language
   */
  async fetchTranslationFile(locale: string) {
    return new Promise((res) => {
      fetch(`translationFiles/${locale}.json`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.addTranslationFile(locale, data);
          res(true);
        })
        .catch((error) => {
          console.error('Error:', error);
          this.addTranslationFile(locale, {});
          res(false);
        });
    });
  }

  /**
   *
   * @param key search key
   * @param interpolations in translation table
   * @param locale
   * @returns tranlsated search key or search key, if nothing matched
   */
  private getInternalTranslation(
    key: string,
    interpolations?: Record<string, string>,
    locale?: string
  ): string {
    if (!key) return '';
    this.currentLanguage =
      locale ||
      this.currentLanguage ||
      this.luigiCoreService.i18n().getCurrentLocale();
    return this.findTranslation(
      key,
      this.translationTable,
      this.currentLanguage,
      interpolations
    );
  }
}
