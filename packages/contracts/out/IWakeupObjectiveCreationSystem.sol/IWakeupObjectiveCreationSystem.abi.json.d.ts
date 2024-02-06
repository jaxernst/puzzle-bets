declare const abi: [
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "alarmTime",
        "type": "uint32"
      }
    ],
    "name": "getBaseReward",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "wakeupTime",
        "type": "uint32"
      },
      {
        "internalType": "int8",
        "name": "playerTimezoneHrs",
        "type": "int8"
      }
    ],
    "name": "newObjective",
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
