import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { IOrderWordItem, TOrderWordValue, IOrderWordFormattedItem, TOrderWordAnswer, TOrderWordAnswerFormatted } from '../../interface';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { OrderWordModel } from '../../exercise/model';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';
import { OrderWordBlockApi } from '../../exercise/api';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { map, skip, debounceTime, share, take, combineLatest, switchMap, mapTo, tap } from 'rxjs/operators';
import * as shuffleSeed from 'shuffle-seed';
import { OrderWordScoreStrategy } from '../../exercise/score';
import { BlockConfig } from '@skyeng/libs/blocks/base/config/config';

@Component({
  selector: 'sky-order-word',
  template: `
    <sky-order-word-view *ngIf="initDone$ | async"
                         [items]="formattedItems$ | async"
                         (set)="set($event)">
    </sky-order-word-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordComponent implements OnInit, OnDestroy {
  @Input() id: string;

  public formattedItems$: Observable<IOrderWordFormattedItem[]>;
  public initDone$: Observable<boolean>;

  private blockApi: OrderWordBlockApi;
  private blockConfig: BlockConfig;
  private items = new BehaviorSubject<IOrderWordItem[]>([]);
  private model: OrderWordModel;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private blockService: BlockService,
  ) {
  }

  public ngOnInit() {
    this.initDone$ = timer(0).pipe(
      mapTo(true),
      tap(() => this.init()),
    );
  }

  // uglyhack due to custom elements hooks calling issue
  private init() {
    this.blockConfig = getBlockConfig(this.elementRef.nativeElement);
    this.model = new OrderWordModel();

    this.blockApi = this.blockService.createApi<TOrderWordValue, TOrderWordAnswer, OrderWordBlockApi>({
      api: OrderWordBlockApi,
      blockId: this.id,
      model: this.model,
      scoreStrategy: OrderWordScoreStrategy,
      blockConfig: this.blockConfig,
    });

    const itemsInitDone$ = this.items.pipe(
      skip(1),
      debounceTime(0),
      take(1),
      share(),
    );

    // set model's correct answer
    itemsInitDone$
      .pipe(
        map(items => items.map(item => item.id)),
        takeUntilDestroyed(this),
      )
      .subscribe(correctAnswer => this.model.addCorrectAnswer(correctAnswer));

    // shuffle items
    itemsInitDone$
      .pipe(
        map(items => this.shuffleItems(items)),
        takeUntilDestroyed(this),
      )
      .subscribe(items => this.items.next(items));

    this.formattedItems$ = itemsInitDone$.pipe(
      switchMap(() => this.items),
      combineLatest(this.blockApi.currentAnswer$),
      map(([ items, currentAnswer ]) => this.formatAnswerItems(items, currentAnswer)),
    );
  }

  public ngOnDestroy() {
    if (this.blockApi) {
      this.blockApi.destroy();
    }
  }

  @Input()
  public addItem = (item: IOrderWordItem): void => {
    this.items.next([
      ...this.items.getValue(),
      item
    ]);
  }

  public set(value: string[]): void {
    this.model.addAnswer({ value });
  }

  private formatAnswerItems(items: IOrderWordItem[], currentAnswer?: TOrderWordAnswerFormatted): IOrderWordFormattedItem[] {
    let orderedItems = items;

    if (currentAnswer) {
      orderedItems = currentAnswer.value.map(({ id }) => items.find(item => item.id === id)!);
    }

    return orderedItems.map(item => {
      const isCorrect = currentAnswer
        ? currentAnswer.value.find(({ id }) => id === item.id)!.isCorrect
        : null;

      return { ...item, isCorrect };
    });
  }

  private shuffleItems(items: IOrderWordItem[]): IOrderWordItem[] {
    if (items.length < 2) {
      return items;
    }

    let seed = items.map(item => item.id).join('');
    let limit = 1000;
    let shuffledItems = items;

    do {
      shuffledItems = shuffleSeed.shuffle(shuffledItems, seed);
      seed += '_';
      limit--;
    } while (limit && (shuffledItems[0] === items[0]));

    return shuffledItems;
  }
}
