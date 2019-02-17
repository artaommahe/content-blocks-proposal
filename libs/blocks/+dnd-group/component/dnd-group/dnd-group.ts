import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import {
  IDndGroupDragItem, IDndGroupDropItem, TDndGroupAnswerValue,
  TDndGroupAnswer, IDndGroupDragItemFormatted, IDndGroupDropItemFormatted,
  IDndGroupAnswerFormatted, TDndGroupDragId, IDropData, TDndGroupDragsScore
} from '../../interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { BaseBlockApi } from '@skyeng/libs/blocks/base/api/base';
import { BlockConfig } from '@skyeng/libs/blocks/base/config/config';
import { BlockApiService } from '@skyeng/libs/blocks/base/api/service/block-api';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';
import { skip, debounceTime, take, share, map, switchMap, first, mapTo, shareReplay } from 'rxjs/operators';
import { DndGroupModel } from '../../exercise/model';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { shuffleItems } from '@skyeng/libs/blocks/base/core/helpers';
import { DndGroupScoreStrategy } from '../../exercise/score';

@Component({
  selector: 'sky-dnd-group',
  template: `
    <sky-dnd-group-view *ngIf="initDone$ | async"
                        [dragItems]="formattedDragItems$ | async"
                        [dropItems]="formattedDropItems$ | async"
                        [isMobile]="isMobile$ | async"
                        [draggingId]="draggingId$ | async"
                        [isCompleted]="isCompleted$ | async"
                        (itemDrag)="onItemDrag($event)"
                        (itemDrop)="onItemDrop($event)">
    </sky-dnd-group-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupComponent implements OnInit, OnDestroy {
  @Input() id: string;

  public formattedDragItems$: Observable<IDndGroupDragItemFormatted[]>;
  public formattedDropItems$: Observable<IDndGroupDropItemFormatted[]>;
  public initDone$: Observable<boolean>;
  public isMobile$: Observable<boolean>;
  public draggingId$: Observable<TDndGroupDragId | null>;
  public isCompleted$: Observable<boolean>;

  private blockApi: BaseBlockApi<TDndGroupAnswerValue, TDndGroupAnswer, DndGroupModel, DndGroupScoreStrategy>;
  private blockConfig: BlockConfig;
  private dragItems = new BehaviorSubject<IDndGroupDragItem[]>([]);
  private dropItems = new BehaviorSubject<IDndGroupDropItem[]>([]);
  private draggingId = new BehaviorSubject<TDndGroupDragId | null>(null);

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

      this.blockApi = this.blockApiService.createApi<
        TDndGroupAnswerValue, TDndGroupAnswer, DndGroupModel, DndGroupScoreStrategy
      >({
        blockId: this.id,
        blockConfig: this.blockConfig,
        model: DndGroupModel,
        scoreStrategy: DndGroupScoreStrategy,
      });

      this.isMobile$ = this.blockConfig.select([ 'isMobile' ], false);

      const itemsInitDone$ = combineLatest(this.dragItems, this.dropItems).pipe(
        skip(1),
        debounceTime(0),
        take(1),
        share(),
      );

      itemsInitDone$
        .pipe(
          takeUntilDestroyed(this),
        )
        .subscribe(([ _, dropItems ]) => this.blockApi.score.setGroupsCount(dropItems.length));

      itemsInitDone$
        .pipe(
          map(([ _, dropItems ]) => this.getCorrectAnswerFromItems(dropItems)),
          takeUntilDestroyed(this),
        )
        .subscribe(correctAnswer => this.blockApi.model.addCorrectAnswer(correctAnswer));

      // wait for correct answer to init api
      itemsInitDone$
        .pipe(
          takeUntilDestroyed(this),
        )
        .subscribe(() => this.blockApi.init());

      // shuffle drags
      itemsInitDone$
        .pipe(
          map(([ dragItems ]) => shuffleItems(dragItems)),
          takeUntilDestroyed(this),
        )
        .subscribe(dragItems => this.dragItems.next(dragItems));

      this.formattedDragItems$ = itemsInitDone$.pipe(
        switchMap(() =>
          combineLatest(
            this.dragItems,
            this.blockApi.model.currentFormattedAnswer$,
            this.blockApi.score.dragsScore$,
          ),
        ),
        map(([ dragItems, currentFormattedAnswer, dragsScore ]) =>
          this.formatDragItems(dragItems, currentFormattedAnswer, dragsScore)
        ),
        shareReplay(1),
      );

      this.formattedDropItems$ = itemsInitDone$.pipe(
        switchMap(() =>
          combineLatest(this.dropItems, this.formattedDragItems$)
        ),
        map(([ dropItems, formattedDragItems ]) => this.formatDropItems(dropItems, formattedDragItems)),
        shareReplay(1),
      );

      this.initDone$ = combineLatest(this.formattedDragItems$, this.formattedDropItems$).pipe(
        debounceTime(0),
        first(),
        mapTo(true),
      );

      this.draggingId$ = this.draggingId.asObservable();

      this.isCompleted$ = this.formattedDragItems$.pipe(
        map(formattedDragItems => formattedDragItems.every(dragItem => !!dragItem.isCorrect)),
      );

      this.changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy() {
  }

  @Input()
  public addDragItem = (dragItem: IDndGroupDragItem): void => {
    this.dragItems.next([ ...this.dragItems.getValue(), dragItem ]);
  }

  @Input()
  public addDropItem = (dropItem: IDndGroupDropItem): void => {
    this.dropItems.next([ ...this.dropItems.getValue(), dropItem ]);
  }

  public onItemDrag(dragItem: IDndGroupDragItemFormatted): void {
    const draggingId = this.draggingId.getValue() === dragItem.id
      ? null
      : dragItem.id;

    this.draggingId.next(draggingId);
  }

  public onItemDrop({ dropItem, draggingId }: IDropData): void {
    const currentAnswer = this.blockApi.model.getCurrentAnswer();
    const currentValue = currentAnswer ? currentAnswer.value : {};

    this.blockApi.model.addAnswer({
      value: {
        ...currentValue,
        [ draggingId ]: dropItem.id
      },
    });

    this.draggingId.next(null);
  }

  private getCorrectAnswerFromItems(dropItems: IDndGroupDropItem[]): TDndGroupAnswerValue {
    return dropItems.reduce<TDndGroupAnswerValue>(
      (value, dropItem) => ({
        ...value,
        ...dropItem.dragIds.reduce<TDndGroupAnswerValue>(
          (drags, dragId) => ({ ...drags, [ dragId ]: dropItem.id }),
          {}
        )
      }),
      {}
    );
  }

  private formatDragItems(
    dragItems: IDndGroupDragItem[],
    currentFormattedAnswer: IDndGroupAnswerFormatted | undefined,
    dragsScore: TDndGroupDragsScore,
  ): IDndGroupDragItemFormatted[] {
    return dragItems.map(dragItem => {
      const dragAnswer = currentFormattedAnswer
        ? currentFormattedAnswer.formattedValue[dragItem.id]
        : null;

      const isCorrect = dragAnswer ? dragAnswer.isCorrect : null;
      const currentDropId = dragAnswer ? dragAnswer.dropId : null;
      const score = dragsScore[dragItem.id] || { right: 0, wrong: 0 };

      return { ...dragItem, isCorrect, currentDropId, score };
    });
  }

  private formatDropItems(
    dropItems: IDndGroupDropItem[],
    formattedDragItems: IDndGroupDragItemFormatted[]
  ): IDndGroupDropItemFormatted[] {
    return dropItems.map(dropItem => {
      const currentDrags = formattedDragItems.filter(dragItem => dragItem.currentDropId === dropItem.id);

      return { ...dropItem, currentDrags };
    });
  }
}
