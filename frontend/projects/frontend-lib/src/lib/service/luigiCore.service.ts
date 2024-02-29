import { Injectable } from '@angular/core';
const luigi = (globalThis as any).Luigi;

@Injectable({
  providedIn: 'root',
})
export class LuigiCoreService {
  auth() {
    return luigi.auth();
  }
  customMessages() {
    return luigi.customMessages();
  }
  navigation() {
    return luigi.navigation();
  }
  setConfig(config: any) {
    return luigi.setConfig(config);
  }
  getConfig() {
    return luigi.getConfig();
  }
  unloadConfig() {
    return luigi.unload();
  }
  resetLuigi() {
    luigi.reset();
  }
  configChanged(scope?: string) {
    luigi.configChanged(scope);
  }
  clearNavigationCache() {
    if (luigi.clearNavigationCache) {
      luigi.clearNavigationCache();
    }
  }
  showAlert(alert: any) {
    return luigi.showAlert(alert);
  }
  ux() {
    return luigi.ux();
  }
  getConfigValue(key: string) {
    return luigi.getConfigValue(key);
  }
  theming() {
    return luigi.theming();
  }
  i18n() {
    return luigi.i18n();
  }
  globalSearch() {
    return luigi.globalSearch();
  }
  routing() {
    return luigi.routing();
  }

  setFeatureToggle(featureToggleName: string) {
    luigi.featureToggles().setFeatureToggle(featureToggleName);
  }

  isFeatureToggleActive(ft: string): boolean {
    return luigi.featureToggles().getActiveFeatureToggleList().includes(ft);
  }
}
