import { Injectable } from '@angular/core';
import { RtmService } from './rtm';
import { SyncApiService } from './sync-api';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '@skyeng/libs/blocks/base/helpers';
import { BLOCK_SYNC_EVENTS } from '@skyeng/libs/blocks/base/sync/const';
import { ISyncData } from '../interface';
import { shareReplay, delayWhen, map } from 'rxjs/operators';
import { TBlockId } from '@skyeng/libs/blocks/base/interface';
import { IBlockSyncRequestRestore, IBlockSyncAdd, IBlockSyncRestore } from '@skyeng/libs/blocks/base/sync/interface';
import { IBlockAnswer } from '@skyeng/libs/blocks/base/model/interface';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private data: ISyncData;

  constructor(
    _rtmService: RtmService,
    private syncApiService: SyncApiService,
  ) {
    const dataLoaded$ = this.syncApiService.load().pipe(
      shareReplay(1),
    );

    dataLoaded$
      .subscribe(data => this.data = data);

    // sending initial data on restore request
    blocksListenGlobalEvent<IBlockSyncRequestRestore>(BLOCK_SYNC_EVENTS.requestRestore)
      .pipe(
        delayWhen(() => dataLoaded$),
        map(({ blockId }) => ({
          blockId,
          data: this.getBlockData(blockId)
        }))
      )
      .subscribe(eventData =>
        blocksDispatchGlobalEvent<IBlockSyncRestore<any>>(BLOCK_SYNC_EVENTS.restore, eventData)
      );

    blocksListenGlobalEvent<IBlockSyncAdd<any>>(BLOCK_SYNC_EVENTS.add)
      .subscribe(({ blockId, data }) => this.add(blockId, data));
  }

  private getBlockData(blockId: TBlockId): IBlockAnswer<any>[] | null {
    return this.data[blockId] || null;
  }

  private add(blockId: TBlockId, blockData: IBlockAnswer<any>): void {
    this.data = {
      ...this.data,
      [ blockId ]: [
        ...(this.data[blockId] || []),
        blockData,
      ],
    };

    this.syncApiService.store(this.data);
  }
}
