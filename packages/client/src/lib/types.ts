export type EvmAddress = `0x${string}`;

export type Game = {
  user: EvmAddress;
  gameType: GameType;
  duration: number;
  status: GameStatus;
  betAmount?: number;
};

export type GameType = "wordle" | "tradle";

export const gameTypeToNumber: Record<GameType, number> = {
  wordle: 0,
  tradle: 1,
};

export const gameNumberToType: Record<number, GameType> = {
  0: "wordle",
  1: "tradle",
};

export enum GameStatus {
  Inactive,
  Pending,
  Active,
  Complete,
}
