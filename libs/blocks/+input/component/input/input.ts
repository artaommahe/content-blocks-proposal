import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy } from '@angular/core';
import { BlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { TInputData } from '../../interface';
import { BlockBaseModel } from '@skyeng/libs/blocks/base/model/base-model';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';

@Component({
  selector: 'sky-input',
  template: `
    <ng-content></ng-content>

    <sky-input-view [correctAnswers]="model.correctAnswers$ | async"
                    [isCorrect]="model.isCorrect$ | async"
                    [value]="model.value$ | async"
                    (valueChange)="setValue($event)">
    </sky-input-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit, OnDestroy {
  @Input() id: string;

  public model: BlockBaseModel<TInputData>;

  private blockApi: BlockApi<TInputData>;

  constructor(
    private blockService: BlockService,
  ) {
  }

  public ngOnInit() {
    this.model = new BlockBaseModel<TInputData>();

    // wait for answers to init
    this.model.answersInited$
      .pipe(
        takeUntilDestroyed(this),
      )
      .subscribe(() => this.init());
  }

  public ngOnDestroy() {
    this.blockApi.destroy();
  }

  // https://github.com/angular/angular/issues/22114
  @Input()
  public addCorrectAnswer = (correctAnswer: string): void => {
    this.model.addCorrectAnswer(correctAnswer);
  }

  public setValue(value: TInputData, sync = true): void {
    this.model.setValue(value);

    if (sync) {
      this.blockApi.sync.set(value);
    }
  }

  private init() {
    this.blockApi = this.blockService.createApi<TInputData>(this.model, {
      blockId: this.id,
      sync: {
        enabled: true,
      },
      score: {
        enabled: true,
      }
    });

    // ---> SYNC PART
    this.blockApi.sync.onData()
      .pipe(
        takeUntilDestroyed(this),
      )
      .subscribe(value => this.setValue(value, false));
    // <---
  }
}
