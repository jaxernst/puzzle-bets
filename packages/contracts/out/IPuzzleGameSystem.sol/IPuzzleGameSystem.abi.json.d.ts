declare const abi: [
  {
    "type": "function",
    "name": "games__claim",
    "inputs": [
      {
        "name": "gameId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "games__joinGame",
    "inputs": [
      {
        "name": "gameId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "games__newGame",
    "inputs": [
      {
        "name": "gameType",
        "type": "uint8",
        "internalType": "enum Game"
      },
      {
        "name": "submissionWindowSeconds",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "inviteExpirationTimestamp",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "games__submitSolution",
    "inputs": [
      {
        "name": "gameId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]; export default abi;
