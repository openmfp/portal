import { IsAlpha, IsNotEmpty } from 'class-validator';

export class EntityParams {
  @IsNotEmpty()
  @IsAlpha()
  entity: string;
}
