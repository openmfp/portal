import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { AuthData } from '../auth/auth-data';


export interface FrontendAuthData {
  accessTokenExpirationDate: number;
  idToken: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private frontendAuthData!: FrontendAuthData;

  constructor() {
  }

  public setAuthData(authData: AuthData): void {
    this.frontendAuthData = {
      accessTokenExpirationDate: this.processExpDate(authData.expires_in),
      idToken: authData.access_token,
    };
  }

  public getAuthData(): FrontendAuthData {
    return this.frontendAuthData;
  }

  private parseJwt = (token: string): any => {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  };

  getToken = (): any => {
    const auth = this.getAuthData();
    if (auth) {
      return auth.idToken;
    }
    return {};
  };

  getUser() {
    const auth = this.getAuthData();
    if (auth) {
      return this.parseJwt(auth.idToken);
    }
    return {};
  }

  getUsername() {
    const tokenValues = this.getUser();
    return tokenValues.sub;
  }

  getUserEmail() {
    const { mail } = this.getUser();
    return mail;
  }

  getUserInfo() {
    const { first_name, last_name, mail, sub } = this.getUser();
    //handle undefined cases of first name or last name
    const initialsFirstName: string =
      typeof first_name === 'undefined' ? '' : first_name[0];
    const initialsLastName: string =
      typeof last_name === 'undefined' ? '' : last_name[0];
    const firstName = typeof first_name === 'undefined' ? '' : first_name;
    const lastName = typeof last_name === 'undefined' ? '' : last_name;

    return {
      name: `${firstName} ${lastName}`,
      email: mail,
      description: mail,
      picture: `https://avatars.wdf.sap.corp/avatar/${sub}`,
      icon: false,
      initials: initialsFirstName + initialsLastName,
    };
  }

  private processExpDate(expiresInMillis: string): number {
    const expiresIn = Number(expiresInMillis);
    return new Date().getTime() + expiresIn * 1000;
  }
}
