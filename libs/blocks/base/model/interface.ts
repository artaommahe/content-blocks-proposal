export interface IBlockAnswer<TValue> {
  value: TValue;
  createdAt: number;
  isCorrect: boolean | null;
}
