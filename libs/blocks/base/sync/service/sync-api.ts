import { TBlockId } from '../../interface';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BLOCK_SYNC_EVENTS } from '../const';
import {
  IBlockSyncAnswer, IBlockSyncRequestRestoreAnswers, IBlockSyncAddAnswer,
  IBlockSyncRestoreAnswers, IBlockSyncEventData, IBlockSyncEvent, IBlockSyncReset,
} from '../interface';
import { Injectable } from '@angular/core';
import { IBlockAnswer } from '../../model/interface';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../../events/events';

@Injectable({ providedIn: 'root' })
export class BlockSyncApi {
  public onRestoreAnswers<TAnswer extends IBlockAnswer<any>>(blockId: TBlockId): Observable<TAnswer[] | null> {
    return blocksListenGlobalEvent<IBlockSyncRestoreAnswers<TAnswer>>(BLOCK_SYNC_EVENTS.restoreAnswers).pipe(
      filter(event => (event.blockId === blockId)),
      map(({ data }) => data),
    );
  }

  public onAnswer<TAnswer extends IBlockAnswer<any>>(blockId: TBlockId): Observable<TAnswer> {
    return blocksListenGlobalEvent<IBlockSyncAnswer<TAnswer>>(BLOCK_SYNC_EVENTS.answer).pipe(
      filter(event => (event.blockId === blockId)),
      map(({ data }) => data),
    );
  }

  public addAnswer<TAnswer extends IBlockAnswer<any>>(blockId: TBlockId, data: TAnswer): void {
    blocksDispatchGlobalEvent<IBlockSyncAddAnswer<TAnswer>>(BLOCK_SYNC_EVENTS.addAnswer, {
      blockId,
      data,
    });
  }

  public requestRestoreAnswers(blockId: TBlockId): void {
    blocksDispatchGlobalEvent<IBlockSyncRequestRestoreAnswers>(BLOCK_SYNC_EVENTS.requestRestoreAnswers, {
      blockId,
    });
  }

  public sendEvent<T>(blockId: TBlockId, eventData: IBlockSyncEventData<T>): void {
    blocksDispatchGlobalEvent<IBlockSyncEvent<T>>(BLOCK_SYNC_EVENTS.sendEvent, {
      blockId,
      eventData,
    });
  }

  public onEvent<T = void>(blockId: TBlockId, eventName: string): Observable<T> {
    return blocksListenGlobalEvent<IBlockSyncEvent<T>>(BLOCK_SYNC_EVENTS.event).pipe(
      filter(event => (event.blockId === blockId) && (event.eventData.event === eventName)),
      map(({ eventData }) => eventData.data),
    );
  }

  public onReset(blockId?: TBlockId): Observable<IBlockSyncReset> {
    return blocksListenGlobalEvent<IBlockSyncReset>(BLOCK_SYNC_EVENTS.reset).pipe(
      filter(event => !event.blockId || (event.blockId === blockId)),
    );
  }
}
