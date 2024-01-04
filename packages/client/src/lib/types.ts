export type EvmAddress = `0x${string}`;

export type Game = {
  user: EvmAddress;
  gameType: GameType;
  duration: number;
  status: GameStatus;
  betAmount?: number;
};

export enum GameType {
  Wordle,
  Tradle,
  Crossword,
  Jigsaw,
}

export enum GameStatus {
  Inactive,
  Pending,
  Active,
  Complete,
}
