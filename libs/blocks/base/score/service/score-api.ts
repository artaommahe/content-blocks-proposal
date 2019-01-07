import { Injectable } from '@angular/core';
import { TBlockId } from '../../interface';
import { IBlockScoreRemove, IBlockScore, IBlockScoreSet } from '../interface';
import { BLOCK_SCORE_EVENT } from '../const';
import { blocksDispatchGlobalEvent } from '../../events/events';

@Injectable({ providedIn: 'root' })
export class BlockScoreApi {
  public remove(blockId: TBlockId): void {
    blocksDispatchGlobalEvent<IBlockScoreRemove>(BLOCK_SCORE_EVENT.remove, {
      blockId,
    });
  }

  public set(blockId: TBlockId, score: IBlockScore): void {
    blocksDispatchGlobalEvent<IBlockScoreSet>(BLOCK_SCORE_EVENT.set, {
      blockId,
      score,
    });
  }
}
