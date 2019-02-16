import { BlockBaseScoreStrategy } from '../../base/score/strategy/base';
import { DndGroupModel } from './model';
import {
  IDndGroupScoreHandlerParams, TDndGroupScoreHandler,
  TDndGroupDragId, TDndGroupAnswerValue, TDndGroupAnswer, TDndGroupDropId,
} from '../interface';
import { IBlockScoreStrategyConfig, IBlockScore } from '../../base/score/interface';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@skyeng/libs/store/store';

interface IScoreDragMetadata {
  right: number;
  wrong: number;
  wrongDrops: TDndGroupDropId[];
}

type TDragsMetadata = Record<TDndGroupDragId, IScoreDragMetadata>;

interface IChangedDragPosition {
  dragId: TDndGroupDragId;
  dropId: TDndGroupDragId | null;
}

const DEFAULT_DRAG_METADATA: IScoreDragMetadata = {
  right: 0,
  wrong: 0,
  wrongDrops: [],
};

const STORE_INITIAL_STATE = {
  drags: <TDragsMetadata> {},
  groupsCount: 0,
};

export class DndGroupScoreStrategy extends BlockBaseScoreStrategy<
  DndGroupModel, TDndGroupAnswer, IDndGroupScoreHandlerParams
> {
  private store = new Store<typeof STORE_INITIAL_STATE>(STORE_INITIAL_STATE);

  constructor(
    config: IBlockScoreStrategyConfig<DndGroupModel>,
  ) {
    super(config);

    this.handlers = [
      this.dndGroupScoreHandler,
    ];
  }

  protected reset(): void {
    super.reset();

    this.storeResetDragsMetadata();
  }

  public setGroupsCount(groupsCount: number): void {
    this.storeSetGroupsCount(groupsCount);
  }

  protected getScoreHandlerParams(model: DndGroupModel): Observable<IDndGroupScoreHandlerParams> {
    const correctAnswer$ = model.correctAnswers$.pipe(
      map(correctAnwers => correctAnwers[0]),
    );

    return combineLatest(model.answers$, correctAnswer$).pipe(
      map(([ answers, correctAnswer ]) => ({ answers, correctAnswer })),
    );
  }

  private dndGroupScoreHandler: TDndGroupScoreHandler = (
    score,
    answer,
    { answers, correctAnswer }
  ) => {
    const groupsCount = this.store.get([ 'groupsCount' ]);
    let dragsMetadata = this.store.get([ 'drags' ]);

    if (!groupsCount) {
      throw new Error('DndGroupScoreStrategy: groups count was not set');
    }

    const changedDragPosition = this.getChangedDragPosition(answer, answers);

    if (!changedDragPosition || !changedDragPosition.dropId) {
      return score;
    }

    let dragMetadata = this.getDragMetadata(dragsMetadata, changedDragPosition.dragId);

    if (dragMetadata.wrongDrops.some(dropId => dropId === changedDragPosition.dropId)) {
      return;
    }

    dragMetadata = this.updateDragMetadata(dragMetadata, groupsCount, changedDragPosition, correctAnswer);

    dragsMetadata = {
      ...dragsMetadata,
      [ changedDragPosition.dragId ]: dragMetadata,
    };

    this.setScoreDragsMetadata(dragsMetadata);

    return this.calculateNewScore(dragsMetadata, score, Object.keys(correctAnswer).length);
  }

  private getChangedDragPosition(
    answer: TDndGroupAnswer,
    answers: TDndGroupAnswer[]
  ): IChangedDragPosition | null {
    const answerIndex = answers.findIndex(({ createdAt }) => createdAt === answer.createdAt);
    const prevAnswerItems = answers[answerIndex - 1]
      ? answers[answerIndex - 1].value
      : {};

      const changedDragId = Object.keys(answer.value)
      .find(dragId => answer.value[dragId] !== prevAnswerItems[dragId]);

    return changedDragId
      ? { dragId: changedDragId, dropId: answer.value[changedDragId] }
      : null;
  }

  private updateDragMetadata(
    dragMetadata: IScoreDragMetadata,
    groupsCount: number,
    { dragId, dropId }: IChangedDragPosition,
    correctAnswer: TDndGroupAnswerValue
  ): IScoreDragMetadata {
    // correct
    if (dropId === correctAnswer[dragId]) {
      dragMetadata = {
        ...dragMetadata,
        right: 1 - dragMetadata.wrong,
      };
    }
    // wrong
    else {
      const scorePerWrong = 1 / (groupsCount - 1);

      dragMetadata = {
        ...dragMetadata,
        wrong: dragMetadata.wrong + scorePerWrong,
        wrongDrops: [ ...dragMetadata.wrongDrops, dropId! ],
      };
    }

    return dragMetadata;
  }

  private calculateNewScore(
    dragsMetadata: Record<TDndGroupDragId, IScoreDragMetadata>,
    score: IBlockScore,
    dragsCount: number,
  ): IBlockScore {
    let right = 0;
    let wrong = 0;

    Object.values(dragsMetadata)
      .forEach(dragScore => {
        right += dragScore.right;
        wrong += dragScore.wrong;
      });

    right /= dragsCount;
    wrong /= dragsCount;

    return { ...score, right, wrong };
  }

  private getDragMetadata(drags: TDragsMetadata, dragId: TDndGroupDragId): IScoreDragMetadata {
    return drags[dragId] || { ...DEFAULT_DRAG_METADATA };
  }

  private setScoreDragsMetadata(drags: TDragsMetadata): void {
    this.store.update(state => ({ ...state, drags }));
  }

  private storeResetDragsMetadata(): void {
    this.store.update(state => ({ ...state, drags: {} }));
  }

  private storeSetGroupsCount(groupsCount: number): void {
    this.store.update(state => ({ ...state, groupsCount }));
  }
}
