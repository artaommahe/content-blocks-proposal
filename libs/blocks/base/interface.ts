export interface IBlockConfig {
  id?: string;
  scoring?: {
    enabled?: boolean;
  };
  sync?: {
    enabled?: boolean;
  };
}
