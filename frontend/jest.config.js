module.exports = {
  // jest-preset-angular@16 dropped the legacy ngcc `globalSetup` entry; the
  // preset alone is sufficient for ivy-only projects (Angular 14+).
  preset: 'jest-preset-angular',
  passWithNoTests: true,
};
