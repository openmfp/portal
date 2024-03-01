import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClientEnvironment } from '../env/client-environment';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnvConfigService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  public async getEnvConfig(): Promise<ClientEnvironment> {
    const envConfigPromise: Promise<ClientEnvironment> = lastValueFrom(
      this.http.get<ClientEnvironment>('/rest/envconfig')
    );
    const envConfig: ClientEnvironment = await envConfigPromise;

    if (envConfig.authData) {
      this.authService.setAuthData(envConfig.authData);
    }

    return envConfigPromise;
  }
}
