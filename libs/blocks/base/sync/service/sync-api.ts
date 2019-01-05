import { TBlockId } from '../../interface';
import { Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../../helpers';
import { filter, map } from 'rxjs/operators';
import { BLOCK_SYNC_EVENTS } from '../const';
import { IBlockSyncData, IBlockSyncRequestRestore, IBlockSyncAdd, IBlockSyncRestore } from '../interface';
import { Injectable } from '@angular/core';
import { IBlockAnswer } from '../../model/interface';

@Injectable({ providedIn: 'root' })
export class BlockSyncApi {
  public onRestore<TValue>(blockId: TBlockId): Observable<IBlockAnswer<TValue>[] | null> {
    return blocksListenGlobalEvent<IBlockSyncRestore<TValue>>(BLOCK_SYNC_EVENTS.restore).pipe(
      filter(event => (event.blockId === blockId)),
      map(({ data }) => data),
    );
  }

  public onData<TValue>(blockId: TBlockId): Observable<TValue | null> {
    return blocksListenGlobalEvent<IBlockSyncData<TValue>>(BLOCK_SYNC_EVENTS.data).pipe(
      filter(event => (event.blockId === blockId)),
      map(({ data }) => data),
    );
  }

  public add<TValue>(blockId: TBlockId, data: IBlockAnswer<TValue>): void {
    blocksDispatchGlobalEvent<IBlockSyncAdd<TValue>>(BLOCK_SYNC_EVENTS.add, {
      blockId,
      data,
    });
  }

  public requestRestore(blockId: TBlockId): void {
    blocksDispatchGlobalEvent<IBlockSyncRequestRestore>(BLOCK_SYNC_EVENTS.requestRestore, {
      blockId,
    });
  }
}
