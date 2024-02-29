import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LuigiDataServiceBase } from './luigi-data-service-base';

@Injectable()
export class LuigiDataService extends LuigiDataServiceBase {
  constructor(private httpServiceImpl: HttpService) {
    super(httpServiceImpl);
  }
}
