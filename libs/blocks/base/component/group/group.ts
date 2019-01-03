import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IBlockConfig } from '../../interface';
import { BlockConfig } from '../../config/config';

@Component({
  selector: 'sky-block-group',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockGroupComponent implements OnChanges {
  @Input() config: string;

  // https://github.com/angular/angular/issues/22114
  @Input()
  public blockConfig = new BlockConfig();

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      const config: IBlockConfig = JSON.parse(this.config);

      this.blockConfig.set(config);
    }
  }
}
