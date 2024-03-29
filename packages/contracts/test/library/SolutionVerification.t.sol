// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import "../../src/library/SolutionVerification.sol";

contract SolutionVerificationLibTest is Test {
  function prepareTestSignature(
    bytes32 gameId,
    address playerAddr,
    uint32 solutionIndex
  ) public pure returns (bytes32) {
    bytes32 parameterHash = keccak256(abi.encodePacked(gameId, playerAddr, solutionIndex));
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", parameterHash));
  }

  function test_verifies_message_signed_by_puzzle_master() public {
    (address master, uint256 key) = makeAddrAndKey("puzzleMaster");

    bytes32 gameId = bytes32("0x1234");
    address playerAddr = address(0x5678);
    uint32 solutionIndex = uint32(1);

    bytes32 messageHash = prepareTestSignature(gameId, playerAddr, solutionIndex);
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, messageHash);

    // Sanity check: Ensure raw ecrecover works with params
    address recoveredAddress = ecrecover(messageHash, v, r, s);
    assertEq(recoveredAddress, master);
    assertEq(
      SolutionVerificationLib.getMessageHash(gameId, playerAddr, solutionIndex),
      keccak256(abi.encodePacked(gameId, playerAddr, solutionIndex))
    );

    bool verified = SolutionVerificationLib.verifyPuzzleMasterSignature(
      gameId,
      playerAddr,
      solutionIndex,
      master,
      abi.encodePacked(r, s, v)
    );

    assert(verified);
  }

  function test_rejects_message_not_signed_by_puzzle_master() public {}
}
