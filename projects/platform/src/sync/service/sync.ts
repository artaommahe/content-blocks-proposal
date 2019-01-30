import { Injectable } from '@angular/core';
import { RtmService } from './rtm';
import { SyncApiService } from './sync-api';
import { BLOCK_SYNC_EVENTS } from '@skyeng/libs/blocks/base/sync/const';
import { ISyncBlocksData } from '../interface';
import { shareReplay, delayWhen, map } from 'rxjs/operators';
import { TBlockId } from '@skyeng/libs/blocks/base/core/interface';
import {
  IBlockSyncRequestRestoreAnswers, IBlockSyncAddAnswer, IBlockSyncRestoreAnswers,
  IBlockSyncAnswer, IBlockSyncEvent, IBlockSyncReset,
} from '@skyeng/libs/blocks/base/sync/interface';
import { IBlockAnswer } from '@skyeng/libs/blocks/base/model/interface';
import { SYNC_EVENS } from '../const';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '@skyeng/libs/blocks/base/events/events';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private blocksData: ISyncBlocksData;

  constructor(
    private rtmService: RtmService,
    private syncApiService: SyncApiService,
  ) {
    this.listenBlocksEvents();
    this.listenRtmEvents();
  }

  public reset(blockId?: TBlockId, sync = true): void {
    blocksDispatchGlobalEvent<IBlockSyncReset>(BLOCK_SYNC_EVENTS.reset, { blockId });

    this.resetBlocksData(blockId, sync);

    if (sync) {
      this.rtmService.send<IBlockSyncReset>(SYNC_EVENS.reset, { blockId });
    }
  }

  private listenBlocksEvents(): void {
    const dataLoaded$ = this.syncApiService.load().pipe(
      shareReplay(1),
    );

    dataLoaded$
      .subscribe(blocksData => this.blocksData = blocksData);

    // sending initial data on restore request
    blocksListenGlobalEvent<IBlockSyncRequestRestoreAnswers>(BLOCK_SYNC_EVENTS.requestRestoreAnswers)
      .pipe(
        delayWhen(() => dataLoaded$),
        map(({ blockId }) => ({
          blockId,
          data: this.getBlockData(blockId)
        }))
      )
      .subscribe(eventData =>
        blocksDispatchGlobalEvent<IBlockSyncRestoreAnswers<any>>(BLOCK_SYNC_EVENTS.restoreAnswers, eventData)
      );

    blocksListenGlobalEvent<IBlockSyncAddAnswer<any>>(BLOCK_SYNC_EVENTS.addAnswer)
      .subscribe(({ blockId, data }) => {
        this.addAnswer(blockId, data);

        this.rtmService.send<IBlockSyncAddAnswer<any>>(SYNC_EVENS.add, { blockId, data });
      });

    blocksListenGlobalEvent<IBlockSyncEvent<any>>(BLOCK_SYNC_EVENTS.sendEvent)
      .subscribe(data => {
        this.rtmService.send<IBlockSyncEvent<any>>(SYNC_EVENS.send, data);
      });
  }

  private listenRtmEvents(): void {
    this.rtmService.on<IBlockSyncAddAnswer<any>>(SYNC_EVENS.add)
      .subscribe(data =>
        blocksDispatchGlobalEvent<IBlockSyncAnswer<any>>(BLOCK_SYNC_EVENTS.answer, data)
      );

    this.rtmService.on<IBlockSyncEvent<any>>(SYNC_EVENS.send)
      .subscribe(data =>
        blocksDispatchGlobalEvent<IBlockSyncEvent<any>>(BLOCK_SYNC_EVENTS.event, data)
      );

    this.rtmService.on<IBlockSyncReset>(SYNC_EVENS.reset)
      .subscribe(data => this.reset(data.blockId, false));
  }

  private getBlockData(blockId: TBlockId): IBlockAnswer<any>[] | null {
    return this.blocksData[blockId] || null;
  }

  private addAnswer(blockId: TBlockId, answer: IBlockAnswer<any>): void {
    this.blocksData = {
      ...this.blocksData,
      [ blockId ]: [
        ...(this.blocksData[blockId] || []),
        answer,
      ],
    };

    this.syncApiService.store(this.blocksData);
  }

  private resetBlocksData(blockId?: TBlockId, sync = true): void {
    let newBlocksData: ISyncBlocksData = {};

    if (blockId) {
      newBlocksData = { ...this.blocksData };
      delete newBlocksData[blockId];
    }

    this.blocksData = newBlocksData;

    if (sync) {
      this.syncApiService.store(this.blocksData);
    }
  }
}
