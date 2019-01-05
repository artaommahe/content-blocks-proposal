import { Injectable } from '@angular/core';
import { BlockApi } from './block-api';
import { TBlockId, IBlockApiConfig } from '../interface';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { BlockScoreApi } from '../score/service/score-api';
import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockSyncApi } from '../sync/service/sync-api';
import { BlockConfig } from '../config/config';
import { IBlockAnswer } from '../model/interface';

@Injectable({ providedIn: 'root' })
export class BlockService {
  constructor(
    private blockScoreApi: BlockScoreApi,
    private blockSyncApi: BlockSyncApi,
  ) {
  }

  public createApi<TValue = void, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>>(
    config: IBlockApiConfig<TValue, TAnswer>
  ): BlockApi<TValue, TAnswer> {
    config.blockId = config.blockId || this.createBlockId();
    config.blockConfig = config.blockConfig || new BlockConfig;

    // TODO: (?) move entities init to BlockApi constructor
    const score = new BlockBaseScoreStrategy({
      blockScoreApi: this.blockScoreApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
    });

    const sync = new BlockBaseSyncStrategy<TValue, TAnswer>({
      blockSyncApi: this.blockSyncApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
    });

    return new BlockApi<TValue, TAnswer>(score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
