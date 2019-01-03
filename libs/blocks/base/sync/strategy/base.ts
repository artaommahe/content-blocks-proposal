import { TBlockId } from '../../interface';
import { Observable, merge } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { IBlockSyncStrategyConfig } from '../interface';
import { BlockSyncApi } from '../service/sync-api';
import { BlockBaseModel } from '../../model/base';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockConfig } from '../../config/config';

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

  public onRestored(): Observable<T> {
    return this.blockSyncApi.onRestored<T>(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  public onData(): Observable<T> {
    return this.blockSyncApi.onData<T>(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  public send(data: T): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncApi.send(this.blockId, data);
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
    // sync new value
    model.value$
      .pipe(
        skip(1),
        filter(() => this.valueIsNotFromSync()),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe((value: T) => this.send(value));

    // set value from sync
    merge(
        this.onRestored(),
        this.onData(),
      )
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(value => {
        this.valueFromSync = true;
        model.setValue(value);
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
