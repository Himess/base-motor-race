// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BaseMotorRaceNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("Base Motor Race", "RACE") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }
    
    function mint(address to, string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        return tokenId;
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
