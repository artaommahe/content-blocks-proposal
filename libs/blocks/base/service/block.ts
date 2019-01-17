import { Injectable } from '@angular/core';
import { BaseBlockApi } from './block-api';
import { TBlockId, IBlockApiConfig, ConstructorType } from '../interface';
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
    TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
    TBlockApi extends BaseBlockApi<TValue, TAnswer> = BaseBlockApi<TValue, TAnswer>,
  >(
    config: IBlockApiConfig<TValue, TAnswer, TBlockApi>
  ): TBlockApi {
    config.blockId = config.blockId || this.createBlockId();
    config.blockConfig = config.blockConfig || new BlockConfig;

    const ScoreStrategy = config.scoreStrategy || BlockBaseScoreStrategy;
    const SyncStrategy = config.syncStrategy || BlockBaseSyncStrategy;

    // TODO: (?) move entities init to BlockApi constructor
    const score = new ScoreStrategy({
      blockScoreApi: this.blockScoreApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
      ...(config.scoreStrategyConfig || {})
    });

    const sync = new SyncStrategy<TValue, TAnswer>({
      blockSyncApi: this.blockSyncApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
    });

    const BlockApi = config.api || (<ConstructorType<TBlockApi>> BaseBlockApi);

    return new BlockApi(config.model, score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
