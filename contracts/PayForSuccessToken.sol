// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PayForSuccessToken is ERC20 {
  constructor() ERC20("PFS Token", "PFST") {
    //Each ERC20 token has 18 decimals like Ethereum
    _mint(msg.sender, 1000000 * 10**18);
  }
}
