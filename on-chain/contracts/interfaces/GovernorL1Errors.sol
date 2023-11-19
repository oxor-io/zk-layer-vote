// SPDX-License-Identifier:MIT
pragma solidity 0.8.20;

interface GovernorL1Errors {
    error GovernorL1__weightMismatch(uint256 providedWeight, uint256 actualWeight);
    error GovernorL1__incorrectProposalId();
    error GovernorL1__rootsAreDiffer();
    error GovernorL1__alreadyVoted();
    error GovernorL1__lengthMismatched();
    error GovernorL1__zeroAddress();
    error GovernorL1__incorrectChainId();
}
