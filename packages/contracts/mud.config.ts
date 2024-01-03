import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    GameStatus: ["Inactive", "Pending", "Active", "Complete"],
  },
  tables: {
    Counter: {
      keySchema: {},
      valueSchema: "uint32",
    },

    // Generic components
    Creator: "address",
    Expiration: "uint256",
    StartTime: "uint256",
  },

  modules: [
    {
      name: "UniqueEntityModule",
      root: true,
      args: [],
    },
  ],
});
