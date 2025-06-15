import { IData } from '@entity/IData';

export interface IApi {
  getInfo(): Promise<IData>;
}
