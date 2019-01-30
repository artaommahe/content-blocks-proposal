import { Injectable } from '@angular/core';
import { BaseBlockApi } from '../base';
import { IBlockApiConfig } from '../interface';
import { BlockScoreApi } from '../../score/service/score-api';
import { BlockBaseSyncStrategy } from '../../sync/strategy/base';
import { BlockSyncApi } from '../../sync/service/sync-api';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';
import { BlockSimpleScoreStrategy } from '../../score/strategy/simple';
import { BlockBaseModel } from '../../model/base';
import { BlockBaseScoreStrategy } from '../../score/strategy/base';
import { TBlockId } from '../../core/interface';

@Injectable({ providedIn: 'root' })
export class BlockApiService {
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
    const Model = config.model || <Constructor<TModel>> <any>  BlockBaseModel;

    const model = new Model();

    // TODO: (?) move entities init to BlockApi constructor
    const score = new ScoreStrategy({
      blockScoreApi: this.blockScoreApi,
      blockId: config.blockId,
      model: model,
      blockConfig: config.blockConfig,
    });

    const sync = new SyncStrategy<TAnswer, TModel>({
      blockSyncApi: this.blockSyncApi,
      blockId: config.blockId,
      model: model,
      blockConfig: config.blockConfig,
    });

    return new BaseBlockApi<TValue, TAnswer, TModel, TScoreStrategy>(model, score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
