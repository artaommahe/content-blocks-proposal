import { Injectable } from '@angular/core';
import { BaseBlockApi } from './block-api';
import { TBlockId, IBlockApiConfig } from '../interface';
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
    TScoreStrategy extends BlockBaseScoreStrategy<TModel, any, any> = BlockSimpleScoreStrategy<TModel>,
  >(
    config: IBlockApiConfig<TModel, TScoreStrategy>
  ): BaseBlockApi<TValue, TAnswer, TModel, TScoreStrategy> {
    config.blockId = config.blockId || this.createBlockId();
    config.blockConfig = config.blockConfig || new BlockConfig();

    // any due to typings mess here
    const ScoreStrategy = config.scoreStrategy || <Constructor<TScoreStrategy>> <any> BlockSimpleScoreStrategy;
    const SyncStrategy = config.syncStrategy || BlockBaseSyncStrategy;

    // TODO: (?) move entities init to BlockApi constructor
    const score = new ScoreStrategy({
      blockScoreApi: this.blockScoreApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
    });

    const sync = new SyncStrategy<TAnswer, TModel>({
      blockSyncApi: this.blockSyncApi,
      blockId: config.blockId,
      model: config.model,
      blockConfig: config.blockConfig,
    });

    return new BaseBlockApi<TValue, TAnswer, TModel, TScoreStrategy>(config.model, score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
