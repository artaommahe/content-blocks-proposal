import { Injectable } from '@angular/core';
import { BlockApi } from './block-api';
import { IBlockConfig, TBlockId } from '../interface';

@Injectable({ providedIn: 'root' })
export class BlockService {
  public createApi<T = void>(config: IBlockConfig = {}): BlockApi<T> {
    config.blockId = config.blockId || this.createBlockId();

    return new BlockApi<T>(config);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
