import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { BlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { TInputData, TInputAnswer } from '../../interface';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { InputModel } from '../../exercise/model';
import { handleKeyUsedScore } from '@skyeng/libs/blocks/base/score/handlers/key';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';

enum INPUT_EVENTS {
  typing = 'typing',
}

@Component({
  selector: 'sky-input',
  template: `
    <ng-content></ng-content>

    <sky-input-view [answers]="model.answers$ | async"
                    [correctAnswers]="model.correctAnswers$ | async"
                    [currentAnswer]="model.currentAnswer$ | async"
                    [value]="value$ | async"
                    (typing)="typing($event)"
                    (useKey)="useKey()"
                    (valueChange)="addAnswer($event)">
    </sky-input-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit, OnDestroy {
  @Input() id: string;

  private blockApi: BlockApi<TInputData, TInputAnswer>;
  private value = new BehaviorSubject<string>('');

  public model: InputModel;
  public value$ = this.value.asObservable();

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

    this.model.currentAnswer$
      .pipe(
        map(currentAnswer => currentAnswer ? currentAnswer.value : ''),
        takeUntilDestroyed(this),
      )
      .subscribe(this.value);
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
    const correctAnswers = this.model.getCorrectAnswers();

    if (!correctAnswers.length) {
      return;
    }

    this.addAnswer(correctAnswers[0], true);
  }

  public typing(value: string): void {
    this.blockApi.sync.sendEvent(INPUT_EVENTS.typing, value);
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

    this.blockApi.sync.onEvent<string>(INPUT_EVENTS.typing)
      .pipe(
        takeUntilDestroyed(this),
      )
      .subscribe(this.value);
  }
}
