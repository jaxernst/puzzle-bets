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
    // Game type
    PuzzleType: "Puzzle",
    GameStatus: "Status",
    WinSchemeType: "WinScheme",

    // Players
    GameCreator: "address",
    TwoPlayerGame: "bool",
    PlayersJoined: "uint16",
    InviteExpiration: "uint256",
    Players: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "bool",
      },
      key: ["gameId", "player"],
    },

    // Game solution submission/verification
    SolutionVerificationMethod: "VerificationMethod",
    PuzzleMasterEoa: "address",
    PuzzleMasterContract: "address",
    SubmissionWindow: "uint32",
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

    // Game bet rules
    BuyInAmount: "uint256",
    BuyInType: "Currency",
    BuyInCurrencyAddress: "address",
    GameBalances: {
      schema: {
        gameId: "bytes32",
        player: "address",
        value: "uint256",
      },
      key: ["gameId", "player"],
    },
  },

  // Game timeline
  GameStartTime: "uint256",
  RematchCount: "uint16",
  VoteRematch: {
    schema: {
      gameId: "bytes32",
      me: "address",
      value: "bool",
    },
    key: ["gameId", "me"],
  },

  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
