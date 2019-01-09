import { TBlockId } from '../../interface';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IBlockSyncStrategyConfig, IBlockSyncReset } from '../interface';
import { BlockSyncApi } from '../service/sync-api';
import { BlockBaseModel } from '../../model/base';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';

export class BlockBaseSyncStrategy<
  TValue,
  TAnswerData extends Object = {},
  TAnswer extends IBlockAnswer<TValue> & TAnswerData = IBlockAnswer<TValue> & TAnswerData
> {
  private blockSyncApi: BlockSyncApi;
  private model: BlockBaseModel<TValue, TAnswerData, TAnswer> | undefined;
  private blockId: TBlockId;
  private blockConfig: BlockConfig;

  private destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };
  private valueFromSync = false;

  constructor(
    config: IBlockSyncStrategyConfig<TValue, TAnswer>,
  ) {
    this.blockSyncApi = config.blockSyncApi;
    this.model = config.model;
    this.blockId = config.blockId;
    this.blockConfig = config.blockConfig;

    this.init();
  }

  private init(): void {
    if (this.model) {
      this.bindToModel(this.model);
    }

    // request initial value
    this.requestRestoreAnswers();
  }

  public destroy(): void {
    //
  }

  public onRestoreAnswers(): Observable<TAnswer[] | null> {
    return this.blockSyncApi.onRestoreAnswers<TAnswer>(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  public onAnswer(): Observable<TAnswer> {
    return this.blockSyncApi.onAnswer<TAnswer>(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  public addAnswer(answer: TAnswer): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncApi.addAnswer(this.blockId, answer);
  }

  public requestRestoreAnswers(): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncApi.requestRestoreAnswers(this.blockId);
  }

  public sendEvent<T = void>(event: string, data: T): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncApi.sendEvent(this.blockId, { event, data });
  }

  public onEvent<T = void>(event: string): Observable<T> {
    return this.blockSyncApi.onEvent<T>(this.blockId, event).pipe(
      filter(() => this.isEnabled()),
    );
  }

  public onReset(): Observable<IBlockSyncReset> {
    return this.blockSyncApi.onReset(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  private isEnabled(): boolean {
    return !!this.blockConfig.get([ 'sync', 'enabled' ]);
  }

  private bindToModel(model: BlockBaseModel<TValue, TAnswerData, TAnswer>): void {
    // sync new value to partners/storage
    model.newAnswer$
      .pipe(
        filter(() => this.valueIsNotFromSync()),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(answer => this.addAnswer(answer));

    // restoring answers
    this.onRestoreAnswers()
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(answers => model.setAnswers(answers));

    // new value from sync
    this.onAnswer()
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(answer => {
        this.valueFromSync = true;
        model.addAnswer(answer);
      });

    // reset model's value
    this.onReset()
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(() => model.setAnswers(null));
  }

  private valueIsNotFromSync(): boolean {
    if (this.valueFromSync) {
      this.valueFromSync = false;

      return false;
    }

    return true;
  }
}
