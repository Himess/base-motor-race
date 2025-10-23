// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BaseMotorRaceNFT is ERC721URIStorage, Ownable {
    
    uint256 private _tokenIdCounter;
    
    // Yeni Rarity Thresholds
    uint256 public constant COMMON_MIN = 5000;      // 5,000m - 7,499m
    uint256 public constant RARE_MIN = 7500;        // 7,500m - 9,999m  
    uint256 public constant EPIC_MIN = 10000;       // 10,000m - 19,999m
    uint256 public constant LEGENDARY_MIN = 20000;  // 20,000m+
    
    struct RaceRecord {
        uint256 score;
        uint256 timestamp;
        address player;
        string rarity;
        bool isWeeklyReward;
        uint256 weekNumber;
        uint8 position; // 0=regular, 1=1st, 2=2nd, 3=3rd
    }
    
    mapping(uint256 => RaceRecord) public raceRecords;
    mapping(address => uint256[]) public playerTokens;
    mapping(address => uint256) public playerHighScore;
    
    // Weekly leaderboard
    struct WeeklyLeader {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    uint256 public currentWeek;
    mapping(uint256 => WeeklyLeader[3]) public weeklyTop3; // Her hafta için top 3
    mapping(uint256 => mapping(address => uint256)) public weeklyHighScores; // Haftalık high scores
    
    // Global leaderboard (all time)
    uint256[10] public topScores;
    address[10] public topPlayers;
    
    event NFTMinted(address indexed player, uint256 indexed tokenId, uint256 score, string rarity);
    event WeeklyRewardMinted(address indexed winner, uint256 indexed tokenId, uint8 position, uint256 weekNumber);
    event HighScoreUpdated(address indexed player, uint256 newHighScore);
    event WeeklyLeaderUpdated(uint256 weekNumber, address indexed player, uint256 score, uint8 position);
    
    constructor() ERC721("Base Motor Race", "RACE") Ownable(msg.sender) {
        _tokenIdCounter = 0;
        currentWeek = 1;
    }
    
    function getRarity(uint256 score) public pure returns (string memory) {
        if (score >= LEGENDARY_MIN) return "Legendary";
        if (score >= EPIC_MIN) return "Epic";
        if (score >= RARE_MIN) return "Rare";
        if (score >= COMMON_MIN) return "Common";
        return "None"; // Below 5000m - no NFT
    }
    
    function canMint(uint256 score) public pure returns (bool) {
        return score >= COMMON_MIN;
    }
    
    // ÜCRETSIZ MINT! (Sadece gas fee)
    function mint(uint256 score, string memory tokenURI) public returns (uint256) {
        require(canMint(score), "Score too low to mint (min 5000m)");
        
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
            rarity: rarity,
            isWeeklyReward: false,
            weekNumber: 0,
            position: 0
        });
        
        // Player tokens
        playerTokens[msg.sender].push(tokenId);
        
        // High score güncelle
        if (score > playerHighScore[msg.sender]) {
            playerHighScore[msg.sender] = score;
            emit HighScoreUpdated(msg.sender, score);
        }
        
        // Weekly high score güncelle
        if (score > weeklyHighScores[currentWeek][msg.sender]) {
            weeklyHighScores[currentWeek][msg.sender] = score;
            updateWeeklyLeaderboard(msg.sender, score);
        }
        
        // Global leaderboard güncelle
        updateGlobalLeaderboard(msg.sender, score);
        
        emit NFTMinted(msg.sender, tokenId, score, rarity);
        
        return tokenId;
    }
    
    // Haftalık leaderboard güncelleme
    function updateWeeklyLeaderboard(address player, uint256 score) private {
        WeeklyLeader[3] storage top3 = weeklyTop3[currentWeek];
        
        // En düşük skoru bul
        uint8 lowestIndex = 0;
        uint256 lowestScore = top3[0].score;
        
        for (uint8 i = 1; i < 3; i++) {
            if (top3[i].score < lowestScore) {
                lowestScore = top3[i].score;
                lowestIndex = i;
            }
        }
        
        // Eğer yeni skor daha yüksekse ekle
        if (score > lowestScore) {
            top3[lowestIndex] = WeeklyLeader({
                player: player,
                score: score,
                timestamp: block.timestamp
            });
            
            emit WeeklyLeaderUpdated(currentWeek, player, score, lowestIndex + 1);
        }
    }
    
    // Global leaderboard güncelleme
    function updateGlobalLeaderboard(address player, uint256 score) private {
        uint256 lowestIndex = 0;
        uint256 lowestScore = topScores[0];
        
        for (uint256 i = 1; i < 10; i++) {
            if (topScores[i] < lowestScore) {
                lowestScore = topScores[i];
                lowestIndex = i;
            }
        }
        
        if (score > lowestScore) {
            topScores[lowestIndex] = score;
            topPlayers[lowestIndex] = player;
        }
    }
    
    // HAFTALIK ÖDÜL MINT (Sadece owner)
    function mintWeeklyReward(
        address winner,
        uint8 position,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(position >= 1 && position <= 3, "Position must be 1, 2, or 3");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(winner, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Özel weekly reward kaydı
        string memory rarity = position == 1 ? "Champion" : position == 2 ? "Runner-up" : "Top 3";
        
        raceRecords[tokenId] = RaceRecord({
            score: 0, // Weekly rewards don't have score
            timestamp: block.timestamp,
            player: winner,
            rarity: rarity,
            isWeeklyReward: true,
            weekNumber: currentWeek,
            position: position
        });
        
        playerTokens[winner].push(tokenId);
        
        emit WeeklyRewardMinted(winner, tokenId, position, currentWeek);
        
        return tokenId;
    }
    
    // Yeni haftayı başlat (Sadece owner - her pazartesi)
    function startNewWeek() public onlyOwner {
        currentWeek++;
    }
    
    // View fonksiyonları
    function getPlayerTokens(address player) public view returns (uint256[] memory) {
        return playerTokens[player];
    }
    
    function getGlobalLeaderboard() public view returns (address[10] memory, uint256[10] memory) {
        return (topPlayers, topScores);
    }
    
    function getWeeklyTop3(uint256 weekNumber) public view returns (WeeklyLeader[3] memory) {
        return weeklyTop3[weekNumber];
    }
    
    function getCurrentWeeklyTop3() public view returns (WeeklyLeader[3] memory) {
        return weeklyTop3[currentWeek];
    }
    
    function getRaceRecord(uint256 tokenId) public view returns (RaceRecord memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return raceRecords[tokenId];
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    function getPlayerWeeklyScore(address player, uint256 weekNumber) public view returns (uint256) {
        return weeklyHighScores[weekNumber][player];
    }
    
    function getPlayerCurrentWeekScore(address player) public view returns (uint256) {
        return weeklyHighScores[currentWeek][player];
    }
}
