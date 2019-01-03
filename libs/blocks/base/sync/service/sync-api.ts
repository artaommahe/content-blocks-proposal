import { TBlockId } from '../../interface';
import { Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../../helpers';
import { filter, map } from 'rxjs/operators';
import { BLOCK_SYNC_EVENTS } from '../const';
import { IBlockSyncData, IBlockSyncRequestRestore, IBlockSendData } from '../interface';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BlockSyncApi {
  public onRestored<T>(blockId: TBlockId): Observable<T | null> {
    return blocksListenGlobalEvent<IBlockSyncData<T>>(BLOCK_SYNC_EVENTS.restored).pipe(
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

  public send<T>(blockId: TBlockId, data: T): void {
    blocksDispatchGlobalEvent<IBlockSendData<T>>(BLOCK_SYNC_EVENTS.send, {
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
