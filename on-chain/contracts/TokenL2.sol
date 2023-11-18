//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TokenL2 is ERC20 {
    constructor() ERC20('Governance Token L2', 'GTL2') {
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }
}
