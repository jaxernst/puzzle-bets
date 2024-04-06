// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { IPlayerSystem } from "./IPlayerSystem.sol";
import { IPuzzleGameCreationSystem } from "./IPuzzleGameCreationSystem.sol";
import { IRematchSystem } from "./IRematchSystem.sol";
import { ISolePlayerToSolveBetSystem } from "./ISolePlayerToSolveBetSystem.sol";
import { ISolutionSubmissionSystem } from "./ISolutionSubmissionSystem.sol";
import { ITwoPlayerSystem } from "./ITwoPlayerSystem.sol";

/**
 * @title IWorld
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface integrates all systems and associated function selectors
 * that are dynamically registered in the World during deployment.
 * @dev This is an autogenerated file; do not edit manually.
 */
interface IWorld is
  IBaseWorld,
  IPlayerSystem,
  IPuzzleGameCreationSystem,
  IRematchSystem,
  ISolePlayerToSolveBetSystem,
  ISolutionSubmissionSystem,
  ITwoPlayerSystem
{}
