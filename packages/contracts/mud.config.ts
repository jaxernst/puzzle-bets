import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    Status: ["Inactive", "Pending", "Active", "Complete"],
    Game: ["Wordle"],
  },
  tables: {
    GameType: "Game",
    GameStatus: "Status",
    SubmissionWindow: "uint32",
    GameStartTime: "uint256",

    // Per player components
    GamePlayer: {
      keySchema: {
        gameId: "bytes32",
        player: "address",
      },
      valueSchema: "bool",
    },
    Solved: {
      keySchema: {
        gameId: "bytes32",
        player: "address",
      },
      valueSchema: "bool",
    },
    Deposit: {
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
  },

  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
