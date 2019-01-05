export interface IBlockAnswer<T> {
  value: T;
  createdAt: number;
  isCorrect: boolean | null;
}
