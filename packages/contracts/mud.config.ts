import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
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
    Player1: "address",
    Player2: "address",

    Solved: {
      keySchema: {
        gameId: "bytes32",
        player: "address",
      },
      valueSchema: "bool",
    },
    Balance: {
      keySchema: {
        gameId: "bytes32",
        player: "address",
      },
      valueSchema: "uint256",
    },
    OtherPlayer: {
      keySchema: {
        gameId: "bytes32",
        me: "address",
      },
      valueSchema: "address",
    },

    RematchCount: "uint16",
    VoteRematch: {
      keySchema: {
        gameId: "bytes32",
        me: "address",
      },
      valueSchema: "bool",
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
