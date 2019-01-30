import { IBlockConfig } from '../core/interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { pluck, tap, distinctUntilChanged, map } from 'rxjs/operators';
import * as deepmerge from 'deepmerge';

export class BlockConfig<T = Required<IBlockConfig>> {
  private config = new BehaviorSubject<T>(<T> {});

  constructor(
  ) {
  }

  /* tslint:disable:max-line-length */
  public get(): T;
  public get<A extends keyof T>(path: [ A ], defaultValue?: T[A]): T[A];
  public get<A extends keyof T, B extends keyof T[A]>(path: [ A, B ], defaultValue?: T[A][B]): T[A][B];
  public get<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B]>(path: [ A, B, C ], defaultValue?: T[A][B][C]): T[A][B][C];
  public get<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C]>(path: [ A, B, C, D ], defaultValue?: T[A][B][C][D]): T[A][B][C][D];
  public get<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D]>(path: [ A, B, C, D, E ], defaultValue?: T[A][B][C][D][E]): T[A][B][C][D][E];
  public get(path?: any[], defaultValue?: any): any {
    let value: any = this.config.getValue();

    if (!path) {
      return value;
    }

    for (const pathField of path) {
      value = value[pathField];

      if (value === undefined) {
        return defaultValue;
      }
    }

    return value;
  }

  public select(): Observable<T>;
  public select<A extends keyof T>(path: [ A ], defaultValue?: T[A]): Observable<T[A]>;
  public select<A extends keyof T, B extends keyof T[A]>(path: [ A, B ], defaultValue?: T[A][B]): Observable<T[A][B]>;
  public select<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B]>(path: [ A, B, C ], defaultValue?: T[A][B][C]): Observable<T[A][B][C]>;
  public select<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C]>(path: [ A, B, C, D ], defaultValue?: T[A][B][C][D]): Observable<T[A][B][C][D]>;
  public select<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D]>(path: [ A, B, C, D, E ], defaultValue?: T[A][B][C][D][E]): Observable<T[A][B][C][D][E]>;
  public select(path?: any[], defaultValue?: any): Observable<any> {
    return this.config.asObservable().pipe(
      path ? pluck(...path) : tap(),
      distinctUntilChanged(),
      map(value => (value !== undefined) ? value : defaultValue),
    );
  }

  public merge(config: Partial<T>): void {
    const newConfig = deepmerge(this.config.getValue(), config, { clone: false });

    this.config.next(newConfig);
  }

  public set(config: T): void {
    this.config.next(config);
  }
}
