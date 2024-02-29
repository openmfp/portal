export interface FeatureTogglesProvider {
  getFeatureToggles(): Promise<Record<string, boolean>>;
}
