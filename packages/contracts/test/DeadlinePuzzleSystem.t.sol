// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Puzzle, Status } from "../src/codegen/common.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { PuzzleMasterEoa, RematchCount, Balance, BuyIn, PuzzleType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration, VoteRematch } from "../src/codegen/index.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract DeadlinePuzzleSystemTest is MudTest {
  using MessageHashUtils for bytes;

  address DEFAULT_PUZZLE_MASTER = address(0x456);
  uint DEFAULT_INVITE_WINDOW_DURATION = 100;

  function test_newGame_GameVariablesAreSetOnCreation() public {
    bytes32 gameId = newDefaultGame(1 ether, address(0x123));
    assertEq(Player1.get(gameId), address(this));
    assertEq(Player2.get(gameId), address(0x123));
    assertEq(PuzzleMasterEoa.get(gameId), address(0x456));
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Pending));
    assertEq(BuyIn.get(gameId), 1 ether);
    assertEq(Balance.get(gameId, address(this)), 1 ether);
    assertEq(SubmissionWindow.get(gameId), 1);
    assertEq(InviteExpiration.get(gameId), block.timestamp + 100);
  }

  function test_joinGame_JoinGameRequiresBuyInDeposit() public {
    address opponent = address(0x123);
    bytes32 gameId = newDefaultGame(1 ether, opponent);

    vm.startPrank(opponent);
    vm.deal(opponent, 1 ether);
    vm.expectRevert("Insufficient buy in");
    IWorld(worldAddress).v1__joinGame(gameId);
    assertEq(Balance.get(gameId, opponent), 0);

    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);
    assertEq(Balance.get(gameId, opponent), 1 ether);
  }

  function test_joinGame_OnlySpecifiedOpponentCanJoinGame() public {
    address opponent = address(0x123);
    bytes32 gameId = newDefaultGame(0 ether, opponent);

    vm.prank(address(0x999));
    vm.expectRevert("You are not the specified player2");
    IWorld(worldAddress).v1__joinGame(gameId);

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);
  }

  function test_joinGame_CancelledGameCannotBeJoined() public {
    bytes32 gameId = newDefaultGame(1 ether, address(0));
    IWorld(worldAddress).v1__cancelPendingGame(gameId);

    vm.prank(address(0x123));
    vm.expectRevert();
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);
  }

  function test_joinGame_GameIsStartedWhenOpponentJoins() public {
    bytes32 gameId = newDefaultGame(0 ether, address(0));

    vm.prank(address(0x999));
    IWorld(worldAddress).v1__joinGame(gameId);
    assertEq(Player2.get(gameId), address(0x999));
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Active));
  }

  function test_joinGame_JoinNotAllowedAfterInviteExpires() public {
    bytes32 gameId = newDefaultGame(0, address(0));
    skip(DEFAULT_INVITE_WINDOW_DURATION + 1);

    vm.expectRevert("Invite expired");
    IWorld(worldAddress).v1__joinGame(gameId);
  }

  function test_cancelPendingGame_BuyInReturnedWhenCreatorCancelsGame() public {
    uint startingBalance = address(this).balance;
    bytes32 gameId = newDefaultGame(1 ether, address(0x123));

    assertEq(address(this).balance, startingBalance - 1 ether);
    IWorld(worldAddress).v1__cancelPendingGame(gameId);
    assertEq(address(this).balance, startingBalance);
  }

  function test_cancelPendingGame_GameCannotBeCancelledOnceStarted() public {
    bytes32 gameId = newDefaultGame(1 ether, address(0));

    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    vm.expectRevert("Game is not pending");
    IWorld(worldAddress).v1__cancelPendingGame(gameId);
  }

  function test_submitSolution_MarksPlayerAsSolved() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address opponent = address(0x123);
    address creator = address(0x999);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: opponent,
      puzzleMaster: master
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    assertEq(Solved.get(gameId, creator), false);
    assertEq(Solved.get(gameId, opponent), false);

    // Sign game solved message with puzzleMaster key for p1
    bytes memory creatorSignature = signPuzzleSolved(masterKey, gameId, creator, 1);

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, creatorSignature);
    assertEq(Solved.get(gameId, creator), true);

    // Sign game solved message with puzzleMaster key for p2
    bytes memory opponentSignature = signPuzzleSolved(masterKey, gameId, opponent, 1);

    vm.prank(opponent);
    IWorld(worldAddress).v1__submitSolution(gameId, opponentSignature);
    assertEq(Solved.get(gameId, opponent), true);
  }

  function test_submitSolution_RevertsWhen_PuzzleMasterSignatureIsInvalid() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address opponent = address(0x123);
    address creator = address(0x999);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: opponent,
      puzzleMaster: master
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    // Attempt to reuse p1's signature for p2 submission
    bytes memory creatorSignature = signPuzzleSolved(masterKey, gameId, creator, 1);

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, creatorSignature);
    assertEq(Solved.get(gameId, creator), true);

    vm.prank(opponent);
    vm.expectRevert("Puzzle master signature invalid");
    IWorld(worldAddress).v1__submitSolution(gameId, creatorSignature);
  }

  function test_submitSolution_RevertsWhen_SubmissionWindowHasClosed() public {
    bytes32 gameId = newDefaultGame(0 ether, address(0));
    IWorld(worldAddress).v1__joinGame(gameId);

    skip(10000);

    bytes memory sig = "ahhhh";
    vm.expectRevert("Submission window closed");
    IWorld(worldAddress).v1__submitSolution(gameId, sig);
  }

  function test_claim_ReturnsEachPlayersDepositAfterTieGame() public {}

  function test_claim_ReturnsFullPoolBalanceToWinnerWithNoProtocolFeeSet() public {}

  function test_claim_TransfersFeeToFeeRecipientWhenWinnerClaimsPool() public {}

  function test_claim_RevertsWhen_NonWinnerAttemptsToClaim() public {}

  function test_voteRematch_ResetsGameStateOnceBothPlayersVote() public {
    (address master, uint256 masterKey) = makeAddrAndKey("master");
    address opponent = address(0x123);
    address creator = address(0x456);

    vm.prank(creator);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: opponent,
      puzzleMaster: master
    });

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    // Both players successfully solve
    bytes memory sig1 = signPuzzleSolved(masterKey, gameId, creator, 1);
    bytes memory sig2 = signPuzzleSolved(masterKey, gameId, opponent, 1);

    vm.prank(creator);
    IWorld(worldAddress).v1__submitSolution(gameId, sig1);
    vm.prank(opponent);
    IWorld(worldAddress).v1__submitSolution(gameId, sig2);

    assertEq(Solved.get(gameId, creator), true);
    assertEq(Solved.get(gameId, opponent), true);

    vm.prank(creator);
    IWorld(worldAddress).v1__voteRematch(gameId);
    assertEq(VoteRematch.get(gameId, creator), true);

    vm.prank(opponent);
    IWorld(worldAddress).v1__voteRematch(gameId);

    assertEq(VoteRematch.get(gameId, creator), false);
    assertEq(VoteRematch.get(gameId, opponent), false);
    assertEq(RematchCount.get(gameId), 1);
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Active));
    assertEq(Solved.get(gameId, creator), false);
    assertEq(Solved.get(gameId, opponent), false);
    assertEq(GameStartTime.get(gameId), block.timestamp);
  }

  function test_voteRematch_RevertsWhen_OnePlayerHasAlreadyWithdrawn() public {
    address opponent = address(0x123);
    address creator = address(0x456);

    vm.prank(creator);
    bytes32 gameId = newDefaultGame(0, opponent);

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);

    skip(1000000);
    vm.prank(opponent);
    IWorld(worldAddress).v1__claim(gameId);

    vm.prank(creator);
    vm.expectRevert("Game is not active");
    IWorld(worldAddress).v1__voteRematch(gameId);
  }

  function newDefaultGame(uint value, address opponent) private returns (bytes32) {
    return
      IWorld(worldAddress).v1__newGame{ value: value }({
        puzzleType: Puzzle.Wordle,
        submissionWindowSeconds: 1,
        inviteExpirationTimestamp: block.timestamp + DEFAULT_INVITE_WINDOW_DURATION,
        opponent: opponent,
        puzzleMaster: address(0x456)
      });
  }

  function signPuzzleSolved(
    uint puzzleMasterPk,
    bytes32 gameId,
    address playerAddr,
    uint32 solutionIndex
  ) private pure returns (bytes memory) {
    bytes memory data = abi.encodePacked(gameId, playerAddr, solutionIndex);
    bytes32 messageHash = data.toEthSignedMessageHash();
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(puzzleMasterPk, messageHash);
    return abi.encodePacked(r, s, v);
  }

  receive() external payable {}
}
