// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

import {IScrollVerifier, IScrollChain} from "./interfaces/IScroll.sol";
import {IStateRootStorage} from "./interfaces/IStateRootStorage.sol";
import {GovernorL1Errors} from "./interfaces/GovernorL1Errors.sol";

import {UltraVerifier} from "./verifier/plonk_vk.sol";

contract GovernorL1 is
    GovernorL1Errors,
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    // ============================
    // ===CONSTANTS & IMMUTABLES===
    // ============================
    uint256 private constant BALANCE_STORAGE_SLOT = 0;
    uint256 private constant SCROLL_SEPOLIA_CHAIN_ID = 534351;
    address private constant SCROLL_CHAIN_ROLLUP_ADDRESS = 0xa13BAF47339d63B743e7Da8741db5456DAc1E556;

    IStateRootStorage public immutable STATE_ROOT_STORAGE;

    // ============================
    // ===== STATE VARIABLES =====
    // ============================
    uint256[] public chainIds;
    mapping(uint256 chainId => address verifier) public verifiers;
    mapping(uint256 proposalId => uint256 batchIndex) public proposalIdToScrollBatchIndex;
    mapping(uint256 => mapping(uint256 => IStateRootStorage.ProposalStateRoot)) public proposalStateRoots;

    mapping(uint256 proposalId => mapping(uint256 chainId => mapping(address voter => bool))) public l2VoteCounter;

    constructor(
        IVotes _token,
        uint256[] memory proverChainIds,
        address[] memory proofVerifiers,
        IStateRootStorage rootStorage
    )
        Governor("Governor")
        GovernorSettings(0, 50400, /* 1 week */ 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
    {
        uint256 verifierLength = proofVerifiers.length;

        if (chainIds.length != verifierLength) {
            revert GovernorL1__lengthMismatched();
        }

        if (address(rootStorage) == address(0)) {
            revert GovernorL1__zeroAddress();
        }

        STATE_ROOT_STORAGE = rootStorage;

        for (uint256 i = 0; i < verifierLength; i++) {
            if (proofVerifiers[i] == address(0)) {
                revert GovernorL1__zeroAddress();
            }

            verifiers[proverChainIds[i]] = proofVerifiers[i];
        }

        chainIds = proverChainIds;
    }

    // ============================
    // ===== PUBLIC FUNCTIONS =====
    // ============================
    function castVoteCC(
        uint256 proposalId,
        address voter,
        uint8 support,
        uint256 weight,
        uint256 chainId,
        bytes calldata proof
    ) public returns (uint256) {
        if (l2VoteCounter[proposalId][chainId][voter]) {
            revert GovernorL1__alreadyVoted();
        }
        l2VoteCounter[proposalId][chainId][voter] = true;

        verifyProof(chainId, proposalId, voter, weight, proof);
        _countVote(proposalId, voter, support, weight, _defaultParams());

        emit VoteCast(voter, proposalId, support, weight, "");
        return weight;
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        uint256 proposalId = super.propose(targets, values, calldatas, description);

        // save L2 state roots in proposal init block
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (chainIds[i] == SCROLL_SEPOLIA_CHAIN_ID) {
                proposalIdToScrollBatchIndex[proposalId] =
                    IScrollChain(SCROLL_CHAIN_ROLLUP_ADDRESS).lastFinalizedBatchIndex();
            } else {
                proposalStateRoots[proposalId][chainIds[i]] = STATE_ROOT_STORAGE.stateRoots(chainIds[i]);
            }
        }

        return proposalId;
    }

    // The following functions are overrides required by Solidity.
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    // ============================
    //  ==== PRIVATE FUNCTIONS ====
    // ============================

    function verifyProof(uint256 chainId, uint256 proposalId, address voter, uint256 weight, bytes calldata proof)
        private
        view
    {
        if (chainId == SCROLL_SEPOLIA_CHAIN_ID) {
            uint256 scrollBatchIndex = proposalIdToScrollBatchIndex[proposalId];
            if (scrollBatchIndex == 0) {
                revert GovernorL1__incorrectProposalId();
            }

            bytes32 storageKey = keccak256(abi.encode(voter, BALANCE_STORAGE_SLOT));

            IScrollVerifier verifier = IScrollVerifier(verifiers[SCROLL_SEPOLIA_CHAIN_ID]);
            (bytes32 stateRootFromUser, bytes32 storageValue) =
                verifier.verifyZkTrieProof(address(token()), storageKey, proof);

            if (weight != uint256(storageValue)) {
                revert GovernorL1__weightMismatch(weight, uint256(storageValue));
            }

            bytes32 rootFromScroll = IScrollChain(SCROLL_CHAIN_ROLLUP_ADDRESS).finalizedStateRoots(scrollBatchIndex);

            if (rootFromScroll != stateRootFromUser) {
                revert GovernorL1__rootsAreDiffer();
            }
        } else {
            UltraVerifier verifier = UltraVerifier(verifiers[chainId]);

            bytes32[] memory publicInputs = new bytes32[](4);

            publicInputs[0] = proposalStateRoots[proposalId][chainId].root;
            publicInputs[1] = bytes32(proposalId);
            publicInputs[2] = bytes32(uint256(uint160(voter)));
            publicInputs[3] = bytes32(weight);

            if (!verifier.verify(proof, publicInputs)) {
                revert GovernorL1__incorrectProof();
            }
        }
    }
}
