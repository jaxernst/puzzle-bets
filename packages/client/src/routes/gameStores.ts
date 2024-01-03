import { writable } from "svelte/store";

export const activeGames = writable([]);

type EvmAddress = `0x${string}`;

const MINUTE = 60;

type Game = {
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

export function GamesStore(user: EvmAddress) {
  const { subscribe, set, update } = writable<Game[]>([]);

  return {
    subscribe,
    newGame: (gameType: GameType) =>
      update((games) => [
        ...games,
        {
          user,
          gameType,
          duration: 15 * MINUTE,
          status: GameStatus.Pending,
        },
      ]),
  };
}
