import { Injectable } from '@angular/core';
import { RtmService } from './rtm';
import { SyncApiService } from './sync-api';
import { BLOCK_SYNC_EVENTS } from '@skyeng/libs/blocks/base/sync/const';
import { ISyncData } from '../interface';
import { shareReplay, delayWhen, map } from 'rxjs/operators';
import { TBlockId } from '@skyeng/libs/blocks/base/interface';
import {
  IBlockSyncRequestRestoreAnswers, IBlockSyncAddAnswer, IBlockSyncRestoreAnswers,
  IBlockSyncAnswer, IBlockSyncEvent,
} from '@skyeng/libs/blocks/base/sync/interface';
import { IBlockAnswer } from '@skyeng/libs/blocks/base/model/interface';
import { SYNC_EVENS } from '../const';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '@skyeng/libs/blocks/base/events/events';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private data: ISyncData;

  constructor(
    private rtmService: RtmService,
    private syncApiService: SyncApiService,
  ) {
    this.listenBlocksEvents();
    this.listenRtmEvents();
  }

  private listenBlocksEvents(): void {
    const dataLoaded$ = this.syncApiService.load().pipe(
      shareReplay(1),
    );

    dataLoaded$
      .subscribe(data => this.data = data);

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
  }

  private getBlockData(blockId: TBlockId): IBlockAnswer<any>[] | null {
    return this.data[blockId] || null;
  }

  private addAnswer(blockId: TBlockId, answer: IBlockAnswer<any>): void {
    this.data = {
      ...this.data,
      [ blockId ]: [
        ...(this.data[blockId] || []),
        answer,
      ],
    };

    this.syncApiService.store(this.data);
  }
}
