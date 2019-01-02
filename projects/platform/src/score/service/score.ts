import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { IScore, TScoreEvent, IScores } from '../interface';
import { shareReplay, scan, map, debounceTime, startWith } from 'rxjs/operators';
import { blocksListenGlobalEvent } from '@skyeng/libs/blocks/base/helpers';
import { BLOCK_SCORE_EVENT } from '@skyeng/libs/blocks/base/score/const';
import { EMPTY_SCORE, TOTAL_SCORE } from '../const';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  public score$: Observable<IScore>;

  constructor(
  ) {
    this.score$ = this.scoreEvents().pipe(
      scan<TScoreEvent, IScores>((scores, event) => this.handleEvent(scores, event), {}),
      debounceTime(0),
      map(scores => this.calculateScore(scores)),
      startWith(EMPTY_SCORE),
      shareReplay(1),
    );
  }

  private scoreEvents(): Observable<TScoreEvent> {
    const events$ = Object.keys(BLOCK_SCORE_EVENT).map((event) =>
      blocksListenGlobalEvent<any>(BLOCK_SCORE_EVENT[event]).pipe(
        map(data => ({ event: BLOCK_SCORE_EVENT[event], data })),
      )
    );

    return merge(...events$);
  }

  private handleEvent(scores: IScores, event: TScoreEvent): IScores {
    if (event.event === BLOCK_SCORE_EVENT.remove) {
      const { [ event.data.blockId ]: blockId, ...newScores } = scores;

      return newScores;
    }
    else if (event.event === BLOCK_SCORE_EVENT.set) {
      return {
        ...scores,
        [ event.data.blockId ]: event.data.score,
      };
    }

    return scores;
  }

  private calculateScore(scores: IScores): IScore {
    const scoreSum = Object.keys(scores).reduce(
      (score, blockId) => {
        const blockScore = scores[blockId];

        return {
          right: score.right + blockScore.right,
          wrong: score.wrong + blockScore.wrong,
          total: score.total + blockScore.maxScore,
        };
      },
      EMPTY_SCORE
    );

    const finalScore = this.normalizeScore(scoreSum);

    return finalScore;
  }

  private normalizeScore(score: IScore): IScore {
    const factor = TOTAL_SCORE / score.total;

    return {
      right: +(score.right * factor).toFixed(2),
      wrong: +(score.wrong * factor).toFixed(2),
      total: +(score.total * factor).toFixed(2),
    };
  }
}
