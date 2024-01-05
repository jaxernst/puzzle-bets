export type EvmAddress = `0x${string}`;

export type Game = {
  user: EvmAddress;
  gameType: GameType;
  duration: number;
  status: GameStatus;
  betAmount?: number;
};

export type GameType = "Worlde" | "Tradle";

export enum GameStatus {
  Inactive,
  Pending,
  Active,
  Complete,
}
