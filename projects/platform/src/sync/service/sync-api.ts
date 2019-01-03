import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ISyncData } from '../interface';
import { map, delay } from 'rxjs/operators';

const LOCAL_STORAGE_KEY = 'blocksSync';
const NETWORK_DELAY_MS = 1000;

@Injectable({ providedIn: 'root' })
export class SyncApiService {
  public load(): Observable<ISyncData> {
    return of(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}').pipe(
      map(data => JSON.parse(data)),
      // network delay
      delay(NETWORK_DELAY_MS),
    );
  }

  public store(data: ISyncData): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }
}
