import { Component, ChangeDetectionStrategy, Output, EventEmitter, OnInit } from '@angular/core';
import { IBlockConfig } from '@skyeng/libs/blocks/base/interface';
import * as deepmerge from 'deepmerge';

const INITIAL_CONFIG: IBlockConfig = {
  sync: {
    enabled: true,
  },
  score: {
    enabled: true,
  }
};

@Component({
  selector: 'config',
  templateUrl: 'config.html',
  styleUrls: [ 'config.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigComponent implements OnInit {
  @Output() configChange = new EventEmitter<IBlockConfig>();

  public config = INITIAL_CONFIG;

  public ngOnInit() {
    this.configChange.emit(this.config);
  }

  public setField(configPart: Partial<IBlockConfig>): void {
    this.config = deepmerge(this.config, configPart, { clone: false });

    this.configChange.emit(this.config);
  }
}
