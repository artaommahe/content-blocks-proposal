import { Injectable } from '@angular/core';
import { BaseBlockApi } from './block-api';
import { TBlockId, IBlockApiConfig, ConstructorType } from '../interface';
import { BlockScoreApi } from '../score/service/score-api';
import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockSyncApi } from '../sync/service/sync-api';
import { BlockConfig } from '../config/config';
import { IBlockAnswer } from '../model/interface';
import { BlockSimpleScoreStrategy } from '../score/strategy/simple';
import { BlockBaseModel } from '../model/base';
import { BlockBaseScoreStrategy } from '../score/strategy/base';

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
    TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>,
    TBlockApi extends BaseBlockApi<TValue, TAnswer, TModel> = BaseBlockApi<TValue, TAnswer, TModel>,
    TScoreStrategy extends BlockBaseScoreStrategy<TValue, TAnswer, TModel> = BlockBaseScoreStrategy<TValue, TAnswer, TModel>,
  >(
    config: IBlockApiConfig<TValue, TAnswer, TModel, TBlockApi, TScoreStrategy>
  ): TBlockApi {
    config.blockId = config.blockId || this.createBlockId();
    config.blockConfig = config.blockConfig || new BlockConfig;

    // TODO: fix any
    const ScoreStrategy = config.scoreStrategy
      || (<ConstructorType<BlockBaseScoreStrategy<TValue, TAnswer, TModel, TAnswer, any>>> BlockSimpleScoreStrategy);
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
