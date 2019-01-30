import { Injectable } from '@angular/core';
import { TBlockId } from '../../core/interface';
import { IBlockScoreRemove, IBlockScore, IBlockScoreSet } from '../interface';
import { BLOCK_SCORE_EVENT } from '../const';
import { blocksDispatchGlobalEvent, blocksListenGlobalEvent } from '../../events/events';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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

  public onSet(blockId: TBlockId): Observable<IBlockScore> {
    return blocksListenGlobalEvent<IBlockScoreSet>(BLOCK_SCORE_EVENT.set).pipe(
      filter(data => data.blockId === blockId),
      map(({ score }) => score),
    );
  }
}
