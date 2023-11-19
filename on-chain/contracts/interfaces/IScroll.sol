// SPDX-License-Identifier:MIT
pragma solidity 0.8.20;

interface IScrollVerifier {
    function verifyZkTrieProof(address account, bytes32 storageKey, bytes calldata proof)
        external
        view
        returns (bytes32 stateRoot, bytes32 storageValue);
}

interface IScrollChain {
    function lastFinalizedBatchIndex() external view returns (uint256);
    function finalizedStateRoots(uint256 index) external view returns (bytes32);
}
