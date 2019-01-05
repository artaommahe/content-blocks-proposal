import { TBlockId } from '../../interface';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IBlockSyncStrategyConfig } from '../interface';
import { BlockSyncApi } from '../service/sync-api';
import { BlockBaseModel } from '../../model/base';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockConfig } from '../../config/config';
import { IAnswer } from '../../model/interface';

export class BlockBaseSyncStrategy<T> {
  private blockSyncApi: BlockSyncApi;
  private model: BlockBaseModel<T> | undefined;
  private blockId: TBlockId;
  private blockConfig: BlockConfig;

  private destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };
  private valueFromSync = false;

  constructor(
    config: IBlockSyncStrategyConfig<T>,
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

  public onRestore(): Observable<IAnswer<T>[]> {
    return this.blockSyncApi.onRestore<T>(this.blockId).pipe(
      filter((data): data is IAnswer<T>[] => this.isEnabled() && !!data),
    );
  }

  public onData(): Observable<T> {
    return this.blockSyncApi.onData<T>(this.blockId).pipe(
      filter((data): data is T => this.isEnabled() && !!data),
    );
  }

  public add(data: IAnswer<T>): void {
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

  private bindToModel(model: BlockBaseModel<T>): void {
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
