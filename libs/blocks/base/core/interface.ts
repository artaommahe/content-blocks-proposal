import { IBlockScoreConfig } from '../score/interface';
import { IBlockSyncConfig } from '../sync/interface';

export type TBlockId = string;

export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
  isMobile?: boolean;
}
