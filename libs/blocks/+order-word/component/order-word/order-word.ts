import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { IOrderWordItem, TOrderWordValue, IOrderWordFormattedItem, TOrderWordAnswer } from '../../interface';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { OrderWordModel } from '../../exercise/model';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';
import { OrderWordBlockApi } from '../../exercise/api';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, skip, debounceTime, share, take, combineLatest, switchMap } from 'rxjs/operators';
import * as shuffleSeed from 'shuffle-seed';

@Component({
  selector: 'sky-order-word',
  template: `
    <sky-order-word-view [items]="formattedItems$ | async"
                         (set)="set($event)">
    </sky-order-word-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordComponent implements OnInit, OnDestroy {
  @Input() id: string;

  public formattedItems$: Observable<IOrderWordFormattedItem[]>;

  private blockApi: OrderWordBlockApi;
  private items = new BehaviorSubject<IOrderWordItem[]>([]);
  private model: OrderWordModel;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private blockService: BlockService,
  ) {
  }

  public ngOnInit() {
    this.model = new OrderWordModel();

    const itemsLoaded$ = this.items.pipe(
      skip(1),
      debounceTime(0),
      take(1),
      share(),
    );

    // set model's correct answer
    itemsLoaded$
      .pipe(
        map(items => items.map(item => item.id)),
        takeUntilDestroyed(this),
      )
      .subscribe(correctAnswer => this.model.addCorrectAnswer(correctAnswer));

    // shuffle items
    itemsLoaded$
      .pipe(
        map(items => this.shuffleItems(items)),
        takeUntilDestroyed(this),
      )
      .subscribe(items => this.items.next(items));

    const correctAnswer$ = this.model.correctAnswers$.pipe(
      map(correctAnswers => correctAnswers[0]),
    );

    this.formattedItems$ = itemsLoaded$.pipe(
      switchMap(() => this.items),
      combineLatest(this.model.answers$, correctAnswer$),
      map(([ items, answers, correctAnswer ]) => this.formatAnswerItems(items, answers, correctAnswer)),
    );

    // wait for correct answers to init
    // TODO: move as observable to blockApi
    this.model.correctAnswersInited$
      .pipe(
        takeUntilDestroyed(this),
      )
      .subscribe(() => this.init());
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

  private init() {
    const blockConfig = getBlockConfig(this.elementRef.nativeElement);

    this.blockApi = this.blockService.createApi<TOrderWordValue, TOrderWordAnswer, OrderWordBlockApi>({
      api: OrderWordBlockApi,
      blockId: this.id,
      model: this.model,
      blockConfig,
    });
  }

  private formatAnswerItems(
    items: IOrderWordItem[],
    answers: TOrderWordAnswer[],
    correctAnswer: string[]
  ): IOrderWordFormattedItem[] {
    const previousAnswerValue = answers[answers.length - 2] ? answers[answers.length - 2].value : null;
    const currentAnswerValue = answers[answers.length - 1] ? answers[answers.length - 1].value : [];

    let orderedItems = items;

    if (currentAnswerValue.length) {
      orderedItems = currentAnswerValue.map(id => items.find(item => item.id === id)!);
    }

    let hasWrongItem = false;
    let newCorrectWasSet = false;
    let lastCorrectIndex = -1;

    return orderedItems.map((item, index) => {
      // TODO: (?) duplicates isCorrect check in scoring
      let isCorrect: boolean | null = null;

      if (
        currentAnswerValue.length
        && !hasWrongItem
        && (index === correctAnswer.indexOf(item.id))
        && (index - lastCorrectIndex === 1)
      ) {
        isCorrect = true;
        lastCorrectIndex = index;

        if (!previousAnswerValue || (index !== previousAnswerValue.indexOf(item.id))) {
          newCorrectWasSet = true;
        }
      }
      else if (
        currentAnswerValue.length
        && !hasWrongItem
        && !newCorrectWasSet
        && (index !== correctAnswer.indexOf(item.id))
      ) {
        isCorrect = false;
        hasWrongItem = true;
      }

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
