import { config, DotenvConfigOutput } from 'dotenv';
import { PortalModuleOptions } from './portal-lib.module';

function bootstrapEnv(options: PortalModuleOptions): void {
  let dotenvConfigOutput: DotenvConfigOutput;
  switch (process.env.NODE_ENV) {
    case 'production':
      return;
    case 'test':
      dotenvConfigOutput = config({
        path: './.env-for-tests',
      });
      console.log(dotenvConfigOutput);
      return;
    default:
      config({
        path: options.envFilePath,
      });
  }
}

export { bootstrapEnv };
