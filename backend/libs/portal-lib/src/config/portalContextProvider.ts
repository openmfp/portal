import { Request, Response } from 'express';

export interface PortalContextProvider {
  getContextValues(
    request: Request,
    response: Response
  ): Promise<Record<string, any>>;
}
