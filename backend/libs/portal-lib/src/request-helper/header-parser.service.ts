import { Injectable } from '@nestjs/common';
import { Request } from 'express';

const tokenPrefix = 'Bearer ';

@Injectable()
export class HeaderParserService {
  extractBearerToken(request: Request) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith(tokenPrefix)) {
      return authHeader.substr(tokenPrefix.length);
    }
    return undefined;
  }
}
