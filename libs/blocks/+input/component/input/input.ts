import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { BlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { TInputData, TInputAnswer } from '../../interface';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { getBlockConfig } from '@skyeng/libs/blocks/base/helpers';
import { getStreamValue } from '@skyeng/libs/base/helpers';
import { InputModel } from '../../exercise/model';
import { handleKeyUsedScore } from '@skyeng/libs/blocks/base/score/handlers/key';

@Component({
  selector: 'sky-input',
  template: `
    <ng-content></ng-content>

    <sky-input-view [answers]="model.answers$ | async"
                    [correctAnswers]="model.correctAnswers$ | async"
                    [currentAnswer]="model.currentAnswer$ | async"
                    (useKey)="useKey()"
                    (valueChange)="addAnswer($event)">
    </sky-input-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit, OnDestroy {
  @Input() id: string;

  public model: InputModel;

  private blockApi: BlockApi<TInputData, TInputAnswer>;

  constructor(
    private blockService: BlockService,
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngOnInit() {
    this.model = new InputModel();

    // wait for correct answers to init
    this.model.correctAnswersInited$
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

  public addAnswer(value: TInputData, isKeyUsed = false): void {
    this.model.addAnswer({ value, isKeyUsed });
  }

  public useKey(): void {
    const correctAnswers = getStreamValue(this.model.correctAnswers$);

    if (!correctAnswers.length) {
      return;
    }

    this.addAnswer(correctAnswers[0], true);
  }

  private init() {
    const blockConfig = getBlockConfig(this.elementRef.nativeElement);

    this.blockApi = this.blockService.createApi<TInputData, TInputAnswer>({
      blockId: this.id,
      model: this.model,
      blockConfig,
      scoreStrategyConfig: {
        handlers: [
          handleKeyUsedScore,
        ]
      }
    });
  }
}
