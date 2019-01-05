import { TBlockId } from '../../interface';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IBlockSyncStrategyConfig } from '../interface';
import { BlockSyncApi } from '../service/sync-api';
import { BlockBaseModel } from '../../model/base';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';

export class BlockBaseSyncStrategy<TValue, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>> {
  private blockSyncApi: BlockSyncApi;
  private model: BlockBaseModel<TValue, TAnswer> | undefined;
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
    this.requestRestore();
  }

  public destroy(): void {
    //
  }

  public onRestore(): Observable<TAnswer[]> {
    return this.blockSyncApi.onRestore<TValue>(this.blockId).pipe(
      filter((data): data is TAnswer[] => this.isEnabled() && !!data),
    );
  }

  public onData(): Observable<TValue> {
    return this.blockSyncApi.onData<TValue>(this.blockId).pipe(
      filter((data): data is TValue => this.isEnabled() && !!data),
    );
  }

  public add(data: TAnswer): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncApi.add(this.blockId, data);
  }

  public requestRestore(): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncApi.requestRestore(this.blockId);
  }

  private isEnabled(): boolean {
    return !!this.blockConfig.get([ 'sync', 'enabled' ]);
  }

  private bindToModel(model: BlockBaseModel<TValue, TAnswer>): void {
    model.newAnswer$
      .pipe(
        filter(() => this.valueIsNotFromSync()),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(answer => this.add(answer));

    // restoring answers
    this.onRestore()
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(data => model.setAnswers(data));

    // new value from sync
    this.onData()
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(value => {
        this.valueFromSync = true;
        model.addAnswer(value);
      });
  }

  private valueIsNotFromSync(): boolean {
    if (this.valueFromSync) {
      this.valueFromSync = false;

      return false;
    }

    return true;
  }
}
