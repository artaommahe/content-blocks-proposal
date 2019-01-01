export type TBlockId = string;

export interface IBlockConfig {
  blockId?: TBlockId;
  scoring?: {
    enabled?: boolean;
  };
  sync?: {
    enabled?: boolean;
  };
}
