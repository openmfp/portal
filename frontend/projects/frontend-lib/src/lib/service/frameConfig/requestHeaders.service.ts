import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { LuigiCoreService } from '../luigiCore.service';

@Injectable({
  providedIn: 'root',
})
export class RequestHeadersService {
  constructor(
    private luigiCoreService: LuigiCoreService,
    private route: ActivatedRoute
  ) {}

  public createOptionsWithAuthHeader() {
    let language = this.luigiCoreService.i18n().getCurrentLocale();
    const authData = this.luigiCoreService.auth()?.store?.getAuthData();

    this.route.queryParams.subscribe((params) => {
      if (params['sap-language']) {
        language = params['sap-language'];
      }
    });
    if (!authData?.idToken) {
      throw new Error(
        'Unable to create authorization header, no id token present.'
      );
    }
    return {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + authData.idToken,
        'Accept-Language': language || '',
      }),
    };
  }
}
