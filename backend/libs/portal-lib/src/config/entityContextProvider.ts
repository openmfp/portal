import { Type } from '@nestjs/common';

export interface EntityContextProvider {
  getContextValues(
    token: string,
    context?: Record<string, any>
  ): Promise<Record<string, any>>;
}

export class EntityNotFoundException extends Error {
  entityType: string;
  entityId: string;

  constructor(entityType: string, entityId: string) {
    super(`${entityType} with id ${entityId} doesn't exist.`);
    this.entityType = entityType;
    this.entityId = entityId;
  }
}

export type EntityContextProviders = Record<
  string,
  Type<EntityContextProvider> | string | symbol
>;
