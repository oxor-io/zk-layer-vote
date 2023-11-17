// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import '@openzeppelin/contracts/governance/Governor.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorSettings.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorVotes.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol';

struct ProposalStateRoot {
    bytes32 root;
    uint256 l2BlockNumber;
}

interface IVerifier {
    function verifyProof(bytes memory _proof, uint256[4] memory _input) external returns (bool);
}

interface IStateRootStorage {
    struct ProposalStateRoot {
        bytes32 root;
        uint256 l2BlockNumber;
    }
    function stateRoots(uint256 chainId) external returns (ProposalStateRoot memory );
}

contract GovernorL1 is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    IStateRootStorage stateRootStorage;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public l2VoteCounter;
    mapping(uint256 => mapping(uint256 => ProposalStateRoot)) public proposalStateRoots;
    mapping(uint256 => IVerifier) public verifiers;

    uint256[2] public chains = [534351, 1]; // scroll, test

    constructor(
        IVotes _token,
        IVerifier scrollVerifier,
        IVerifier verifier,
        IStateRootStorage rootStarage
    )
        Governor('Governor')
        GovernorSettings(7200 /* 1 day */, 50400 /* 1 week */, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
    {   
        stateRootStorage = rootStarage;
        verifiers[0] = verifier;
        verifiers[534351] = scrollVerifier;
    }

    function castVoteFromL2(
        uint256 proposalId, 
        address voter, 
        uint8 support,
        address l2TokenAddress,
        uint256 weight, 
        uint256 chainId, 
        bytes calldata proof) public returns (uint256) {
        // TODO
        // _validateStateBitmap(proposalId, _encodeStateBitmap(ProposalState.Active));

        // TODO token address check

        checkProof(chainId, proposalStateRoots[proposalId][chainId].root, proof, voter, l2TokenAddress, weight);

        require(l2VoteCounter[proposalId][chainId][voter] == false);
        l2VoteCounter[proposalId][chainId][voter] = true;

        _countVote(proposalId, voter, support, weight, _defaultParams());

        emit VoteCast(voter, proposalId, support, weight, "");

        return weight;
    }

    function checkProof(
        uint256 chainId,
        bytes32 root,
        bytes calldata proof,
        address voter,
        address l2TokenAddress,
        uint256 weight
    ) internal {
        if (chainId == 534351) { // scroll sepolia
            // TODO check proof
        } else { // other chains
            require(
            verifiers[0].verifyProof(
                proof,
                [uint256(root), uint256(uint160(voter)), uint256(uint160(l2TokenAddress)), weight]
            ),
            "Invalid proof"
            );
        }
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        // TODO save state roots
        super.propose(targets, values, calldatas, description);
    }

    // The following functions are overrides required by Solidity.

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(
        uint256 blockNumber
    ) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}
