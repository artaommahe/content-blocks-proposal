import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import {
  IDndGroupDragItem, IDndGroupDropItem, TDndGroupAnswerValue,
  TDndGroupAnswer, IDndGroupDragItemFormatted, IDndGroupDropItemFormatted, IDndGroupAnswerFormatted
} from '../../interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { BaseBlockApi } from '@skyeng/libs/blocks/base/api/base';
import { BlockConfig } from '@skyeng/libs/blocks/base/config/config';
import { BlockApiService } from '@skyeng/libs/blocks/base/api/service/block-api';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';
import { skip, debounceTime, take, share, map, switchMap, first, mapTo, publishReplay, refCount } from 'rxjs/operators';
import { DndGroupModel } from '../../exercise/model';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { shuffleItems } from '@skyeng/libs/blocks/base/core/helpers';

@Component({
  selector: 'sky-dnd-group',
  template: `
    <sky-dnd-group-view *ngIf="initDone$ | async"
                        [dragItems]="formattedDragItems$ | async"
                        [dropItems]="formattedDropItems$ | async">
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

  private blockApi: BaseBlockApi<TDndGroupAnswerValue, TDndGroupAnswer, DndGroupModel>;
  private blockConfig: BlockConfig;
  private dragItems = new BehaviorSubject<IDndGroupDragItem[]>([]);
  private dropItems = new BehaviorSubject<IDndGroupDropItem[]>([]);

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

      this.blockApi = this.blockApiService.createApi<TDndGroupAnswerValue, TDndGroupAnswer, DndGroupModel>({
        blockId: this.id,
        blockConfig: this.blockConfig,
        model: DndGroupModel
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
          combineLatest(this.dragItems, this.blockApi.model.currentFormattedAnswer$),
        ),
        map(([ dragItems, currentFormattedAnswer ]) => this.formatDragItems(dragItems, currentFormattedAnswer)),
        publishReplay(1),
        refCount(),
      );

      this.formattedDropItems$ = itemsInitDone$.pipe(
        switchMap(() =>
          combineLatest(this.dropItems, this.formattedDragItems$)
        ),
        map(([ dropItems, formattedDragItems ]) => this.formatDropItems(dropItems, formattedDragItems)),
        publishReplay(1),
        refCount(),
      );

      this.initDone$ = combineLatest(this.formattedDragItems$, this.formattedDropItems$).pipe(
        debounceTime(0),
        first(),
        mapTo(true),
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
    currentFormattedAnswer: IDndGroupAnswerFormatted | undefined
  ): IDndGroupDragItemFormatted[] {
    return dragItems.map(dragItem => {
      const dragAnswer = currentFormattedAnswer
        ? currentFormattedAnswer.formattedValue[dragItem.id]
        : null;

      const isCorrect = dragAnswer ? dragAnswer.isCorrect : null;
      const currentDropId = dragAnswer ? dragAnswer.dropId : null;

      return { ...dragItem, isCorrect, currentDropId };
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
