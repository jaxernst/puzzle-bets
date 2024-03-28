declare const abi: [
  {
    "type": "function",
    "name": "getEthSignedMessageHash",
    "inputs": [
      {
        "name": "messageHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getMessageHash",
    "inputs": [
      {
        "name": "gameId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "solutionIndex",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "verify",
    "inputs": [
      {
        "name": "gameId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "solutionIndex",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "puzzleMaster",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "puzzleMasterSignature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "pure"
  }
]; export default abi;
