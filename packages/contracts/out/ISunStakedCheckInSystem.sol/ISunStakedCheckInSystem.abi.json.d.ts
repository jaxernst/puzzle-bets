declare const abi: [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "entity",
        "type": "bytes32"
      }
    ],
    "name": "SunStakedCheckIn_complete",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "entity",
        "type": "bytes32"
      }
    ],
    "name": "SunStakedCheckIn_confirmWakeup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "wakeupObjective",
        "type": "bytes32"
      },
      {
        "internalType": "uint32",
        "name": "numWeeks",
        "type": "uint32"
      },
      {
        "internalType": "uint8[]",
        "name": "challengeDays",
        "type": "uint8[]"
      }
    ],
    "name": "SunStakedCheckIn_enter",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; export default abi;
