// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IBTToken is ERC20, Ownable {
    constructor() ERC20("IBT Token", "IBT") {
        // Optionally mint initial supply to the deployer
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    // Owner-only mint
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Anyone can burn from their own balance
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
