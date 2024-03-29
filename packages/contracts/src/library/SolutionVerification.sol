// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/console.sol";

library SolutionVerificationLib {
  function verify(
    bytes32 gameId,
    address player,
    uint32 solutionIndex,
    address puzzleMaster,
    bytes memory puzzleMasterSignature
  ) public returns (bool) {
    bytes32 preHash = getMessageHash(gameId, player, solutionIndex);
    bytes32 ethSignedMessage = getEthSignedMessageHash(preHash);
    address recoveredAddress = _recoverSigner(ethSignedMessage, puzzleMasterSignature);
    return recoveredAddress == puzzleMaster;
  }

  function getMessageHash(bytes32 gameId, address player, uint32 solutionIndex) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(gameId, player, solutionIndex));
  }

  function getEthSignedMessageHash(bytes32 messageHash) public pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
  }

  function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal view returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
    console.log(v);
    console.logBytes(bytes.concat(r));
    console.logBytes(bytes.concat(s));
    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function _splitSignature(bytes memory signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(signature.length == 65, "invalid signature length");

    // ecrecover takes the signature parameters, and the only way to get them
    // currently is to use assembly.
    /// @solidity memory-safe-assembly
    assembly {
      r := mload(add(signature, 0x20))
      s := mload(add(signature, 0x40))
      v := byte(0, mload(add(signature, 0x60)))
    }
  }
}
