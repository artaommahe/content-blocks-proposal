import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { BaseBlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
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

    <sky-input-view [blockId]="id"
                    [correctAnswers]="model.correctAnswers$ | async"
                    [currentAnswer]="model.currentAnswer$ | async"
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
  public model: InputModel;
  public value$ = this.value.asObservable();
  public wrongAnswersCount$: Observable<number>;

  constructor(
    private blockService: BlockService,
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngOnInit() {
    this.blockConfig = getBlockConfig(this.elementRef.nativeElement);
    this.model = new InputModel();

    this.isMobile$ = this.blockConfig.select([ 'isMobile' ], false);

    // wait for correct answers to init api
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

    this.wrongAnswersCount$ = this.model.answers$.pipe(
      map(answers => answers.filter(answer => answer.isCorrect === false)),
      map(answers => answers.length),
    );
  }

  public ngOnDestroy() {
    this.blockApi.destroy();
  }

  // https://github.com/angular/angular/issues/22114
  @Input()
  public addCorrectAnswer = (correctAnswer: string): void => {
    this.model.addCorrectAnswer(correctAnswer);
  }

  public addAnswer(value: TInputValue, params: IAddAnswerParams = {}): void {
    if (!value) {
      return;
    }

    const isCorrect = (params.isTyping ? null : undefined);
    const isKeyUsed = params.isKeyUsed || false;

    this.model.addAnswer({ value, isKeyUsed, isCorrect });
  }

  public useKey(): void {
    const correctAnswers = this.model.getCorrectAnswers();

    if (!correctAnswers.length) {
      return;
    }

    this.addAnswer(correctAnswers[0], { isKeyUsed: true });
  }

  public typing(value: string): void {
    this.addAnswer(value, { isTyping: true });
  }

  private init() {
    this.blockApi = this.blockService.createApi<TInputValue, TInputAnswer, InputModel, InputScoreStrategy>({
      blockId: this.id,
      model: this.model,
      blockConfig: this.blockConfig,
      scoreStrategy: InputScoreStrategy,
    });
  }
}
