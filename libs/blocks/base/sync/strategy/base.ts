import { TBlockId } from '../../interface';
import { Observable, merge } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { IBlockSyncConfig } from '../interface';
import { BlockSyncApi } from '../service/sync-api';
import { BlockBaseModel } from '../../model/base';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';

export class BlockBaseSyncStrategy<T> {
  private destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };
  private valueFromSync = false;

  constructor(
    private blockSyncService: BlockSyncApi,
    private model: BlockBaseModel<T>,
    private blockId: TBlockId,
    private config: IBlockSyncConfig,
  ) {
    this.init();
  }

  private init(): void {
    // sync changed value
    this.model.value$
      .pipe(
        skip(1),
        filter(() => this.valueIsNotFromSync()),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(value => this.set(value));

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
        this.model.setValue(value);
      });

    // request initial value
    this.blockSyncService.requestRestore(this.blockId);
  }

  public destroy(): void {
    //
  }

  private onRestored(): Observable<T> {
    return this.blockSyncService.onRestored<T>(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  private onData(): Observable<T> {
    return this.blockSyncService.onData<T>(this.blockId).pipe(
      filter(() => this.isEnabled()),
    );
  }

  private set(data: T): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockSyncService.set(this.blockId, data);
  }

  private isEnabled(): boolean {
    return this.config && this.config.enabled;
  }

  private valueIsNotFromSync(): boolean {
    if (this.valueFromSync) {
      this.valueFromSync = false;

      return false;
    }

    return true;
  }
}
