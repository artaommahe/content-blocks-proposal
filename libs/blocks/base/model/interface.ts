export interface IAnswer<T> {
  value: T;
  createdAt: number;
  isCorrect: boolean | null;
}
