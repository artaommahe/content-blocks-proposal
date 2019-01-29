declare module 'shuffle-seed' {
  interface IShuffleSeed {
    shuffle<T>(array: T[], seed?: string): T[];
    unshuffle<T>(array: T[], seed?: string): T[];
  }

  let s: IShuffleSeed;
  export = s;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
