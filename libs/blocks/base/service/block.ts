import { Injectable } from '@angular/core';
import { BlockApi } from './block-api';
import { IBlockConfig } from '../interface';

@Injectable({ providedIn: 'root' })
export class BlockService {
  public createApi<T = void>(config: IBlockConfig = {}): BlockApi<T> {
    config.id = config.id || this.createId();

    return new BlockApi<T>(config);
  }

  private createId(): string {
    return (Math.random() * 100000).toString();
  }
}
