import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BaseBlockApi } from '@skyeng/libs/blocks/base/api/base';
import { BlockApiService } from '@skyeng/libs/blocks/base/api/service/block-api';
import { TInputValue, TInputAnswer } from '../../interface';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { InputModel } from '../../exercise/model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getBlockConfig } from '@skyeng/libs/blocks/base/config/helpers';
import { InputScoreStrategy } from '../../exercise/score';
import { BlockConfig } from '@skyeng/libs/blocks/base/config/config';

interface IAddAnswerParams {
  isKeyUsed?: boolean;
  isTyping?: boolean;
}

@Component({
  selector: 'sky-input',
  template: `
    <ng-content></ng-content>

    <sky-input-view *ngIf="blockApi"
                    [blockId]="id"
                    [correctAnswers]="blockApi.model.correctAnswers$ | async"
                    [currentAnswer]="blockApi.model.currentAnswer$ | async"
                    [isMobile]="isMobile$ | async"
                    [value]="value$ | async"
                    [wrongAnswersCount]="wrongAnswersCount$ | async"
                    (typing)="typing($event)"
                    (useKey)="useKey()"
                    (valueChange)="addAnswer($event)">
    </sky-input-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit, OnDestroy {
  @Input() id: string;

  private blockApi: BaseBlockApi<TInputValue, TInputAnswer, InputModel, InputScoreStrategy>;
  private blockConfig: BlockConfig;
  private value = new BehaviorSubject<string>('');

  public isMobile$: Observable<boolean>;
  public value$ = this.value.asObservable();
  public wrongAnswersCount$: Observable<number>;

  constructor(
    private blockApiService: BlockApiService,
    private elementRef: ElementRef<HTMLElement>,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  public ngOnInit() {
    // empty inputs bug https://github.com/angular/angular/issues/28266
    window.setTimeout(() => {
      this.blockConfig = getBlockConfig(this.elementRef.nativeElement);

      this.blockApi = this.blockApiService.createApi<TInputValue, TInputAnswer, InputModel, InputScoreStrategy>({
        blockId: this.id,
        model: InputModel,
        blockConfig: this.blockConfig,
        scoreStrategy: InputScoreStrategy,
      });

      this.isMobile$ = this.blockConfig.select([ 'isMobile' ], false);

      // wait for correct answers to init api
      this.blockApi.correctAnswersInited$
        .pipe(
          takeUntilDestroyed(this),
        )
        .subscribe(() => this.blockApi.init());

      this.blockApi.model.currentAnswer$
        .pipe(
          map(currentAnswer => currentAnswer ? currentAnswer.value : ''),
          takeUntilDestroyed(this),
        )
        .subscribe(this.value);

      this.wrongAnswersCount$ = this.blockApi.model.answers$.pipe(
        map(answers => answers.filter(answer => answer.isCorrect === false)),
        map(answers => answers.length),
      );

      this.changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy() {
    this.blockApi.destroy();
  }

  // https://github.com/angular/angular/issues/22114
  @Input()
  public addCorrectAnswer = (correctAnswer: string): void => {
    this.blockApi.model.addCorrectAnswer(correctAnswer);
  }

  public addAnswer(value: TInputValue, params: IAddAnswerParams = {}): void {
    if (!value) {
      return;
    }

    const isCorrect = (params.isTyping ? null : undefined);
    const isKeyUsed = params.isKeyUsed || false;

    this.blockApi.model.addAnswer({ value, isKeyUsed, isCorrect });
  }

  public useKey(): void {
    const correctAnswers = this.blockApi.model.getCorrectAnswers();

    if (!correctAnswers.length) {
      return;
    }

    this.addAnswer(correctAnswers[0], { isKeyUsed: true });
  }

  public typing(value: string): void {
    this.addAnswer(value, { isTyping: true });
  }
}
