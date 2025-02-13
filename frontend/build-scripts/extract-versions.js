const packageLockJson = require('../package-lock.json');
const fs = require('fs');
const path = require('path');

const config = {
  portal: packageLockJson.version,
  angularCore: packageLockJson.packages['node_modules/@angular/core']?.version,
  portalUi:
    packageLockJson.packages['node_modules/@openmfp/portal-ui-lib']?.version,
  luigiCore:
    packageLockJson.packages['node_modules/@luigi-project/core']?.version,
  luigiClient:
    packageLockJson.packages['node_modules/@luigi-project/client']?.version,
  ui5WebComponents:
    packageLockJson.packages['node_modules/@ui5/webcomponents']?.version,
  ui5WebComponentsBase:
    packageLockJson.packages['node_modules/@ui5/webcomponents-base']?.version,
  ui5WebComponentsIcons:
    packageLockJson.packages['node_modules/@ui5/webcomponents-icons']?.version,
  fundamentalsCore:
    packageLockJson.packages['node_modules/@fundamental-ngx/core']?.version,
  fundamentalsCdk:
    packageLockJson.packages['node_modules/@fundamental-ngx/cdk']?.version,
  fundamentalsI18n:
    packageLockJson.packages['node_modules/@fundamental-ngx/i18n']?.version,
};

for (const [key] of Object.entries(config)) {
  if (!config[key]) {
    delete config[key];
  }
}

const outputPath = path.resolve(
  __dirname,
  '../',
  'src',
  'assets',
  'dependencies-versions.json'
);

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
