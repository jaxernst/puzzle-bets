// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

contract PuzzleGameSystem is System {
  function createGame(
    Puzzle puzzleType,
    WinScheme winScheme,
    uint buyInAmount,
    Currency buyInCurrency,
    uint16 numPlayers,
    uint32 submissionWndow,
    VerificationMethod verificationMethod
  ) public {}

  function startGame() public {}
}
