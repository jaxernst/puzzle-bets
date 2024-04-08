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
    Puzzle: ["Wordle"],
    Status: ["Cancelled", "Pending", "Active", "Complete"],
    VerificationMethod: ["Contract", "Eoa"],
    WinScheme: ["FirstToSolve", "HighScore", "SoleSolver"],
    Currency: ["Eth", "ERC20"],
  },
  tables: {
    PuzzleType: "Puzzle",
    GameStatus: "Status",
    WinSchemeType: "WinScheme",
    NumberOfPlayers: "uint16",

    SolutionVerificationMethod: "VerificationMethod",
    PuzzleMasterEoa: "address",
    PuzzleMasterContract: "address",

    BuyInAmount: "uint256",
    BuyInType: "Currency",
    BuyInCurrencyAddress: "address",

    SubmissionWindow: "uint32",
    InviteExpiration: "uint256",
    GameStartTime: "uint256",
    RematchCount: "uint16",

    Players: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "bool",
      },
      key: ["gameId", "player"],
    },

    GameBalances: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint256",
      },
      key: ["gameId", "player"],
    },

    Solved: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "bool",
      },
      key: ["gameId", "player"],
    },

    Score: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint32",
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
