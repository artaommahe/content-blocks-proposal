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

  public createApi<
    TValue = void,
    TAnswerData extends Object = {},
    TAnswer extends IBlockAnswer<TValue> & TAnswerData = IBlockAnswer<TValue> & TAnswerData
  >(
    config: IBlockApiConfig<TValue, TAnswerData, TAnswer>
  ): BlockApi<TValue, TAnswer> {
    config.blockId = config.blockId || this.createBlockId();
    config.blockConfig = config.blockConfig || new BlockConfig;

    // TODO: (?) move entities init to BlockApi constructor
    const score = new BlockBaseScoreStrategy({
      blockScoreApi: this.blockScoreApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
      ...(config.scoreStrategyConfig || {})
    });

    const sync = new BlockBaseSyncStrategy<TValue, TAnswerData, TAnswer>({
      blockSyncApi: this.blockSyncApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
    });

    return new BlockApi<TValue, TAnswerData, TAnswer>(score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
