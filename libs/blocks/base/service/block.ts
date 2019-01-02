import { Injectable } from '@angular/core';
import { BlockApi } from './block-api';
import { IBlockConfig, TBlockId } from '../interface';
import { BlockBaseScoreStrategy } from '../score/strategy/score';
import { Sync } from '../sync/sync';
import { BlockScoreService } from '../score/service/score';
import { BlockBaseModel } from '../model/base-model';

@Injectable({ providedIn: 'root' })
export class BlockService {
  constructor(
    private blockScoreService: BlockScoreService,
  ) {
  }

  public createApi<T = void>(model: BlockBaseModel<T>, config: IBlockConfig = {}): BlockApi<T> {
    config.blockId = config.blockId || this.createBlockId();

    const score = new BlockBaseScoreStrategy(this.blockScoreService, model, config.blockId, config.score);
    const sync = new Sync<T>(config.blockId, config.sync);

    return new BlockApi<T>(score, sync);
  }

  private createBlockId(): TBlockId {
    return (Math.random() * 100000).toString();
  }
}
