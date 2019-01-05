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
  public onRestore<T>(blockId: TBlockId): Observable<IBlockAnswer<T>[] | null> {
    return blocksListenGlobalEvent<IBlockSyncRestore<T>>(BLOCK_SYNC_EVENTS.restore).pipe(
      filter(event => (event.blockId === blockId)),
      map(({ data }) => data),
    );
  }

  public onData<T>(blockId: TBlockId): Observable<T | null> {
    return blocksListenGlobalEvent<IBlockSyncData<T>>(BLOCK_SYNC_EVENTS.data).pipe(
      filter(event => (event.blockId === blockId)),
      map(({ data }) => data),
    );
  }

  public add<T>(blockId: TBlockId, data: IBlockAnswer<T>): void {
    blocksDispatchGlobalEvent<IBlockSyncAdd<T>>(BLOCK_SYNC_EVENTS.add, {
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
