// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BaseMotorRaceNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIdCounter;
    uint256 public constant MINT_FEE = 0.0001 ether; // 0.0001 ETH (~$0.25)
    
    // Skor kategorileri ve rarity seviyeleri
    uint256 public constant LEGENDARY_THRESHOLD = 1000; // 1000m+
    uint256 public constant EPIC_THRESHOLD = 500;      // 500-999m
    uint256 public constant RARE_THRESHOLD = 250;      // 250-499m
    // 0-249m = Common
    
    struct RaceRecord {
        uint256 score;
        uint256 timestamp;
        address player;
        string rarity;
    }
    
    mapping(uint256 => RaceRecord) public raceRecords;
    mapping(address => uint256[]) public playerTokens;
    mapping(address => uint256) public playerHighScore;
    
    // En yüksek skorlar (leaderboard için)
    uint256[10] public topScores;
    address[10] public topPlayers;
    
    event NFTMinted(address indexed player, uint256 indexed tokenId, uint256 score, string rarity);
    event HighScoreUpdated(address indexed player, uint256 newHighScore);
    
    constructor() ERC721("Base Motor Race", "RACE") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }
    
    function getRarity(uint256 score) public pure returns (string memory) {
        if (score >= LEGENDARY_THRESHOLD) return "Legendary";
        if (score >= EPIC_THRESHOLD) return "Epic";
        if (score >= RARE_THRESHOLD) return "Rare";
        return "Common";
    }
    
    function mint(uint256 score, string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(score > 0, "Score must be greater than 0");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        string memory rarity = getRarity(score);
        
        // NFT'yi mint et
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Record kaydet
        raceRecords[tokenId] = RaceRecord({
            score: score,
            timestamp: block.timestamp,
            player: msg.sender,
            rarity: rarity
        });
        
        // Player tokens
        playerTokens[msg.sender].push(tokenId);
        
        // High score güncelle
        if (score > playerHighScore[msg.sender]) {
            playerHighScore[msg.sender] = score;
            emit HighScoreUpdated(msg.sender, score);
        }
        
        // Leaderboard güncelle
        updateLeaderboard(msg.sender, score);
        
        emit NFTMinted(msg.sender, tokenId, score, rarity);
        
        return tokenId;
    }
    
    function updateLeaderboard(address player, uint256 score) private {
        // En düşük top score'u bul
        uint256 lowestIndex = 0;
        uint256 lowestScore = topScores[0];
        
        for (uint256 i = 1; i < 10; i++) {
            if (topScores[i] < lowestScore) {
                lowestScore = topScores[i];
                lowestIndex = i;
            }
        }
        
        // Eğer yeni skor daha yüksekse ekle
        if (score > lowestScore) {
            topScores[lowestIndex] = score;
            topPlayers[lowestIndex] = player;
        }
    }
    
    function getPlayerTokens(address player) public view returns (uint256[] memory) {
        return playerTokens[player];
    }
    
    function getLeaderboard() public view returns (address[10] memory, uint256[10] memory) {
        return (topPlayers, topScores);
    }
    
    function getRaceRecord(uint256 tokenId) public view returns (RaceRecord memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return raceRecords[tokenId];
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Owner fonksiyonları
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    function setMintFee(uint256 newFee) public onlyOwner {
        // Yeni mint ücreti belirlemek için (opsiyonel)
    }
}
