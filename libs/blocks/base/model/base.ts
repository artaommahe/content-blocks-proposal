import { Observable } from 'rxjs';
import { map, skip, debounceTime, take, mapTo } from 'rxjs/operators';
import { IBlockAnswer } from './interface';
import { Store } from '@skyeng/libs/store/store';

interface IStoreState<TValue, TAnswer> {
  answers: TAnswer[];
  correctAnswers: TValue[];
}

interface IStoreEvents<TAnswer> {
  newAnswer: TAnswer;
  reset: void;
}

export class BlockBaseModel<
  TValue,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>
> {
  protected store = new Store<IStoreState<TValue, TAnswer>, IStoreEvents<TAnswer>>({
    answers: [],
    correctAnswers: [],
  });

  public answers$ = this.store.select([ 'answers' ]);
  public correctAnswers$ = this.store.select([ 'correctAnswers' ]);
  public correctAnswersInited$: Observable<void>;
  public currentAnswer$: Observable<TAnswer | undefined>;
  public newAnswer$ = this.store.on('newAnswer');
  public reset$ = this.store.on('reset');

  constructor(
  ) {
    this.currentAnswer$ = this.answers$.pipe(
      map(answers => answers[answers.length - 1]),
    );

    this.correctAnswersInited$ = this.correctAnswers$.pipe(
      skip(1),
      debounceTime(0),
      take(1),
      mapTo(undefined),
    );
  }

  public addCorrectAnswer(correctAnswer: TValue): void {
    this.storeAddCorrectAnswer(correctAnswer);
  }

  public addAnswer(answerPart: Partial<TAnswer>): void {
    const currentAnswer = this.getCurrentAnswer();

    if (currentAnswer
      && (answerPart.value === currentAnswer.value)
      && (currentAnswer.isCorrect !== null)
    ) {
      return;
    }

    const answer = this.createAnswer(answerPart);

    this.storeAddAnswer(answer);

    this.store.fire('newAnswer', answer);
  }

  public setAnswers(newAnswers: TAnswer[] | null): void {
    newAnswers = newAnswers || [];

    this.storeSetAnswers(newAnswers);
  }

  public reset(): void {
    this.setAnswers([]);

    this.store.fire('reset');
  }

  public getCorrectAnswers(): TValue[] {
    return this.store.get([ 'correctAnswers' ]);
  }

  public getCurrentAnswer(): TAnswer | undefined {
    const answers = this.store.get([ 'answers' ]);

    return answers.length
      ? answers[answers.length - 1]
      : undefined;
  }

  public getAnswers(): TAnswer[] {
    return this.store.get([ 'answers' ]);
  }

  protected createAnswer(answer: Partial<TAnswer>): TAnswer {
    const isCorrect = answer.isCorrect !== undefined
      ? answer.isCorrect
      : this.isCorrect(answer.value);

    return <TAnswer> {
      // https://github.com/Microsoft/TypeScript/issues/10727
      ...((<Object> answer) || {}),
      createdAt: Date.now(),
      isCorrect,
    };
  }

  protected isCorrect(value?: TValue): boolean {
    const correctAnswers = this.getCorrectAnswers();

    return !!value && correctAnswers.includes(value);
  }

  protected storeAddCorrectAnswer(correctAnswer: TValue): void {
    this.store.update(state => ({
      ...state,
      correctAnswers: [
        ...state.correctAnswers,
        correctAnswer,
      ],
    }));
  }

  protected storeSetAnswers(answers: TAnswer[]): void {
    this.store.update(state => ({ ...state, answers }));
  }

  protected storeAddAnswer(answer: TAnswer): void {
    this.store.update(state => ({
      ...state,
      answers: [
        ...state.answers,
        answer,
      ],
    }));
  }
}
