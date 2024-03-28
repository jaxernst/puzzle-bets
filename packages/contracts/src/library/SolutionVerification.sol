// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

library SolutionVerificationLib {
  function verify(
    bytes32 gameId,
    address player,
    uint32 solutionIndex,
    address puzzleMaster,
    bytes memory puzzleMasterSignature
  ) public pure returns (bool) {
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

  function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);

    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function _splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");

    assembly {
      /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

      // first 32 bytes, after the length prefix
      r := mload(add(sig, 32))
      // second 32 bytes
      s := mload(add(sig, 64))
      // final byte (first byte of the next 32 bytes)
      v := byte(0, mload(add(sig, 96)))
    }

    // implicitly return (r, s, v)
  }
}
