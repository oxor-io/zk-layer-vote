//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';

contract VotesTokenL1 is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20('Governance Token L1', 'GTL1') ERC20Permit('GTL1') {
        _mint(msg.sender, 100_000 * 1e18);
    }

    // The functions below are overrides required by Solidity.

    function nonces(
        address owner
    ) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return ERC20Permit.nonces(owner);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Votes) {
        ERC20Votes._update(from, to, value);
    }
}
