import { defineWorld } from "@latticexyz/world";
/**
 * TODO
 * - Add 'puzzle master' verifications
 * - Add a fee take mechanism
 * - Add 'public' / 'private' matches
 */
export default defineWorld({
  namespace: "games",
  enums: {
    Status: ["Inactive", "Pending", "Active", "Complete"],
    Game: ["Wordle"],
  },
  tables: {
    GameType: "Game",
    GameStatus: "Status",
    BuyIn: "uint256",
    SubmissionWindow: "uint32",
    InviteExpiration: "uint256",
    GameStartTime: "uint256",
    PuzzleMasterEoa: "address",
    Player1: "address",
    Player2: "address",
    RematchCount: "uint16",

    Solved: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "bool",
      },
      key: ["gameId", "player"],
    },
    Balance: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint256",
      },
      key: ["gameId", "player"],
    },

    VoteRematch: {
      schema: {
        gameId: "bytes32",
        me: "address",
        value: "bool",
      },
      key: ["gameId", "me"],
    },
  },

  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
