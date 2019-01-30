import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IOrderWordItem, TOrderWordValue, IOrderWordFormattedItem, TOrderWordAnswer, IOrderWordAnswerFormatted } from '../../interface';
import { BlockApiService } from '@skyeng/libs/blocks/base/api/service/block-api';
import { OrderWordModel } from '../../exercise/model';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, skip, debounceTime, share, take, combineLatest, switchMap } from 'rxjs/operators';
import * as shuffleSeed from 'shuffle-seed';
import { OrderWordScoreStrategy } from '../../exercise/score';
import { BlockConfig } from '@skyeng/libs/blocks/base/config/config';
import { BaseBlockApi } from '@skyeng/libs/blocks/base/api/base';

@Component({
  selector: 'sky-order-word',
  template: `
    <sky-order-word-view *ngIf="formattedItems$"
                         [blockId]="id"
                         [isMobile]="isMobile$ | async"
                         [items]="formattedItems$ | async"
                         (set)="addAnswer($event)">
    </sky-order-word-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordComponent implements OnInit, OnDestroy {
  @Input() id: string;

  public formattedItems$: Observable<IOrderWordFormattedItem[]>;
  public isMobile$: Observable<boolean>;

  private blockApi: BaseBlockApi<TOrderWordValue, TOrderWordAnswer, OrderWordModel, OrderWordScoreStrategy>;
  private blockConfig: BlockConfig;
  private items = new BehaviorSubject<IOrderWordItem[]>([]);

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private blockApiService: BlockApiService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  public ngOnInit() {
    // empty inputs bug https://github.com/angular/angular/issues/28266
    window.setTimeout(() => {
      this.blockConfig = getBlockConfig(this.elementRef.nativeElement);

      this.blockApi = this.blockApiService.createApi<TOrderWordValue, TOrderWordAnswer, OrderWordModel, OrderWordScoreStrategy>({
        blockId: this.id,
        model: OrderWordModel,
        scoreStrategy: OrderWordScoreStrategy,
        blockConfig: this.blockConfig,
      });

      this.isMobile$ = this.blockConfig.select([ 'isMobile' ], false);

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
        .subscribe(correctAnswer => this.blockApi.model.addCorrectAnswer(correctAnswer));

      // wait for correct answer to init api
      itemsInitDone$
        .pipe(
          takeUntilDestroyed(this),
        )
        .subscribe(() => this.blockApi.init());

      // shuffle items
      itemsInitDone$
        .pipe(
          map(items => this.shuffleItems(items)),
          takeUntilDestroyed(this),
        )
        .subscribe(items => this.items.next(items));

      this.formattedItems$ = itemsInitDone$.pipe(
        switchMap(() => this.items),
        combineLatest(this.blockApi.model.currentFormattedAnswer$),
        map(([ items, currentFormattedAnswer ]) => this.formatAnswerItems(items, currentFormattedAnswer)),
      );

      this.changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy() {
    this.blockApi.destroy();
  }

  @Input()
  public addItem = (item: IOrderWordItem): void => {
    this.items.next([
      ...this.items.getValue(),
      item
    ]);
  }

  public addAnswer(value: string[]): void {
    this.blockApi.model.addAnswer({ value });
  }

  private formatAnswerItems(items: IOrderWordItem[], currentAnswer?: IOrderWordAnswerFormatted): IOrderWordFormattedItem[] {
    let orderedItems = items;

    if (currentAnswer) {
      orderedItems = currentAnswer.formattedValue.map(({ id }) => items.find(item => item.id === id)!);
    }

    return orderedItems.map(item => {
      const isCorrect = currentAnswer
        ? currentAnswer.formattedValue.find(({ id }) => id === item.id)!.isCorrect
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
