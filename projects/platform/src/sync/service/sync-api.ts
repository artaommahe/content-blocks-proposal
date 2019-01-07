import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ISyncBlocksData } from '../interface';
import { map, delay } from 'rxjs/operators';

const LOCAL_STORAGE_KEY = 'blocksSync';
const NETWORK_DELAY_MS = 1000;

@Injectable({ providedIn: 'root' })
export class SyncApiService {
  public load(): Observable<ISyncBlocksData> {
    return of(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}').pipe(
      map(blocksData => JSON.parse(blocksData)),
      // network delay
      delay(NETWORK_DELAY_MS),
    );
  }

  public store(blocksData: ISyncBlocksData): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blocksData));
  }
}
