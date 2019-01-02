import { IBlockScoreConfig } from './score/interface';
import { IBlockSyncConfig } from './sync/interface';

export type TBlockId = string;

export interface IBlockConfig {
  blockId?: TBlockId;
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
}
