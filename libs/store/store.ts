import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {take, map, filter, pluck, distinctUntilChanged, tap} from 'rxjs/operators';

export interface IEvent<TEvents, TEvent extends keyof TEvents = keyof TEvents> {
  type: TEvent;
  data?: TEvents[TEvent];
}

export class StoreReadonly<TState, TEvents = void> {
  protected events = new Subject<IEvent<TEvents>>();
  protected store: BehaviorSubject<TState>;

  constructor(
    initialState: TState = <TState> {},
  ) {
    this.store = new BehaviorSubject<TState>(initialState);
  }

  /* tslint:disable:max-line-length */
  public get<A extends keyof TState>(path: [ A ], defaultValue?: TState[A]): TState[A];
  public get<A extends keyof TState, B extends keyof TState[A]>(path: [ A, B ], defaultValue?: TState[A][B]): TState[A][B];
  public get<A extends keyof TState, B extends keyof TState[A], C extends keyof TState[A][B]>(path: [ A, B, C ], defaultValue?: TState[A][B][C]): TState[A][B][C];
  public get<A extends keyof TState, B extends keyof TState[A], C extends keyof TState[A][B], D extends keyof TState[A][B][C]>(path: [ A, B, C, D ], defaultValue?: TState[A][B][C][D]): TState[A][B][C][D];
  public get<A extends keyof TState, B extends keyof TState[A], C extends keyof TState[A][B], D extends keyof TState[A][B][C], E extends keyof TState[A][B][C][D]>(path: [ A, B, C, D, E ], defaultValue?: TState[A][B][C][D][E]): TState[A][B][C][D][E];
  public get(path: any[], defaultValue?: any): any {
    let value: any;
    this.select(<any> path, defaultValue).pipe(
        take(1),
      )
      .subscribe(data => value = data);
    return value;
  }

  public on<TEvent extends keyof TEvents>(type: TEvent): Observable<TEvents[TEvent]> {
    return this.events.asObservable().pipe(
      filter((event): event is IEvent<TEvents, TEvent> => event.type === type),
      map(event => event.data!),
    );
  }

  public select(): Observable<TState>;
  public select<A extends keyof TState>(path: [ A ], defaultValue?: TState[A]): Observable<TState[A]>;
  public select<A extends keyof TState, B extends keyof TState[A]>(path: [ A, B ], defaultValue?: TState[A][B]): Observable<TState[A][B]>;
  public select<A extends keyof TState, B extends keyof TState[A], C extends keyof TState[A][B]>(path: [ A, B, C ], defaultValue?: TState[A][B][C]): Observable<TState[A][B][C]>;
  public select<A extends keyof TState, B extends keyof TState[A], C extends keyof TState[A][B], D extends keyof TState[A][B][C]>(path: [ A, B, C, D ], defaultValue?: TState[A][B][C][D]): Observable<TState[A][B][C][D]>;
  public select<A extends keyof TState, B extends keyof TState[A], C extends keyof TState[A][B], D extends keyof TState[A][B][C], E extends keyof TState[A][B][C][D]>(path: [ A, B, C, D, E ], defaultValue?: TState[A][B][C][D][E]): Observable<TState[A][B][C][D][E]>;
  public select(path?: any[], defaultValue?: any): Observable<any> {
    return this.store.asObservable().pipe(
      path ? pluck(...path) : tap(),
      distinctUntilChanged(),
      map(value => (value !== undefined) ? value : defaultValue),
    );
  }
}

export class Store<TState, TEvents = void> extends StoreReadonly<TState, TEvents> {
  public fire<TEvent extends keyof TEvents>(type: TEvent, data?: TEvents[TEvent]): void {
    this.events.next({ type, data });
  }

  public getReadonly(): StoreReadonly<TState, TEvents> {
    return this;
  }

  public update(reducer: (state: TState) => TState) {
    const state = this.store.getValue();
    const newState = reducer(state);
    this.store.next(newState);
  }
}
