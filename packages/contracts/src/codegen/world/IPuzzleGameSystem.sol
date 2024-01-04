// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

import { Game } from "./../common.sol";

/**
 * @title IPuzzleGameSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IPuzzleGameSystem {
  function newGame(Game gameType, uint32 submissionWindow) external payable;

  function joinGame(bytes32 gameId) external payable;

  function submitSolution(bytes32 gameId) external;

  function claim(bytes32 gameId) external;
}
