import { Injectable } from '@angular/core';
import { BlockApi } from './block-api';
import { TBlockId, IBlockApiConfig } from '../interface';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { BlockScoreApi } from '../score/service/score-api';
import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockSyncApi } from '../sync/service/sync-api';

@Injectable({ providedIn: 'root' })
export class BlockService {
  constructor(
    private blockScoreApi: BlockScoreApi,
    private blockSyncApi: BlockSyncApi,
  ) {
  }

  public createApi<T = void>(config: IBlockApiConfig<T>): BlockApi<T> {
    config.blockId = config.blockId || this.createBlockId();
    config.blockConfig = config.blockConfig || {};

    // TODO: (?) move entities init to BlockApi constructor
    const score = new BlockBaseScoreStrategy({
      blockScoreApi: this.blockScoreApi,
      blockId: config.blockId,
      model: config.model,
      scoreConfig: config.blockConfig.score,
    });

    const sync = new BlockBaseSyncStrategy<T>({
      blockSyncApi: this.blockSyncApi,
      blockId: config.blockId,
      model: config.model,
      syncConfig: config.blockConfig.sync,
    });

    return new BlockApi<T>(score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
