import type { Entity } from "@latticexyz/recs";

export type EvmAddress = `0x${string}`;

export type Game = {
  id: Entity;
  type: GameType;
  status: GameStatus;
  p1: EvmAddress;
  p2: EvmAddress;
  gameType: GameType;
  duration: number;
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
