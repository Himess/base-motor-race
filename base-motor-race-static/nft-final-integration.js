<!-- 
  FİNAL NFT ENTEGRASYONU
  Ücretsiz mint + Yeni skor sistemi (5k-7.5k-10k-20k)
-->

<script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>

<script>
// ====================================
// BASE MAINNET CONFIG
// ====================================
const BASE_CHAIN_ID = 8453;
const BASE_RPC_URL = 'https://mainnet.base.org';
const BASE_EXPLORER_URL = 'https://basescan.org';

// TODO: Deploy sonrası güncellenecek!
const NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// Final NFT Contract ABI
const NFT_ABI = [
    "function mint(uint256 score, string memory tokenURI) public returns (uint256)",
    "function getRarity(uint256 score) public pure returns (string memory)",
    "function canMint(uint256 score) public pure returns (bool)",
    "function playerHighScore(address player) public view returns (uint256)",
    "function getPlayerTokens(address player) public view returns (uint256[])",
    "function getCurrentWeeklyTop3() public view returns (tuple(address player, uint256 score, uint256 timestamp)[3])",
    "function totalSupply() public view returns (uint256)",
    "function currentWeek() public view returns (uint256)"
];

let provider = null;
let signer = null;

// ====================================
// YENİ RARITY SİSTEMİ
// ====================================
const RARITY_CONFIG = {
    COMMON: {
        min: 5000,
        max: 7499,
        name: 'Common',
        icon: '🏍️',
        color: '#808080',
        message: 'Good run!'
    },
    RARE: {
        min: 7500,
        max: 9999,
        name: 'Rare',
        icon: '💎',
        color: '#14F195',
        message: 'Rare achievement!'
    },
    EPIC: {
        min: 10000,
        max: 19999,
        name: 'Epic',
        icon: '💜',
        color: '#9945FF',
        message: 'EPIC RUN!'
    },
    LEGENDARY: {
        min: 20000,
        max: Infinity,
        name: 'Legendary',
        icon: '👑',
        color: '#FFD700',
        message: 'LEGENDARY STATUS!'
    }
};

function getScoreRarity(score) {
    if (score < 5000) return null; // Cannot mint
    
    for (const [key, config] of Object.entries(RARITY_CONFIG)) {
        if (score >= config.min && score <= config.max) {
            return config;
        }
    }
    
    return null;
}

// ====================================
// MINT DURUMU KONTROLÜ
// ====================================
function canMintNFT(score) {
    return score >= 5000;
}

function getNextRarityTarget(score) {
    if (score < 5000) return { target: 5000, rarity: 'Common' };
    if (score < 7500) return { target: 7500, rarity: 'Rare' };
    if (score < 10000) return { target: 10000, rarity: 'Epic' };
    if (score < 20000) return { target: 20000, rarity: 'Legendary' };
    return null; // Already Legendary!
}

// ====================================
// GAME OVER SCREEN GÜNCELLEME
// ====================================
function updateGameOverScreen(score) {
    const rarity = getScoreRarity(score);
    const nextTarget = getNextRarityTarget(score);
    
    // Rarity badge ekle
    let rarityHTML = '';
    if (rarity) {
        rarityHTML = `
            <div class="rarity-badge" style="
                background: linear-gradient(135deg, ${rarity.color}22, ${rarity.color}44);
                border: 2px solid ${rarity.color};
                color: ${rarity.color};
            ">
                ${rarity.icon} ${rarity.name.toUpperCase()}
            </div>
            <p style="color: ${rarity.color}; font-size: 16px; margin: 10px 0;">
                ${rarity.message}
            </p>
        `;
    } else {
        rarityHTML = `
            <div style="
                background: rgba(255, 0, 0, 0.1);
                border: 2px solid #ff0066;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
            ">
                <p style="color: #ff0066; margin: 0;">
                    ❌ Score too low to mint (min 5,000m)
                </p>
                <p style="color: #ffaa00; font-size: 14px; margin-top: 10px;">
                    ${5000 - score}m to go! 🏍️
                </p>
            </div>
        `;
    }
    
    // Next target bilgisi
    let targetHTML = '';
    if (nextTarget && rarity) {
        const remaining = nextTarget.target - score;
        targetHTML = `
            <p style="color: #00ffff; font-size: 14px; margin-top: 15px;">
                💡 ${remaining.toLocaleString()}m to ${nextTarget.rarity}!
            </p>
        `;
    }
    
    // Game Over screen'e ekle
    const gameOverContent = document.querySelector('#gameOverScreen .content');
    if (gameOverContent) {
        // Mevcut içeriğe ekle
        const rarityDiv = document.createElement('div');
        rarityDiv.innerHTML = rarityHTML + targetHTML;
        gameOverContent.insertBefore(rarityDiv, gameOverContent.querySelector('#nftMintBtn'));
    }
    
    // Mint button'ı güncelle
    const mintBtn = document.getElementById('nftMintBtn');
    if (mintBtn) {
        if (canMintNFT(score)) {
            mintBtn.disabled = false;
            mintBtn.textContent = `${rarity.icon} Mint NFT - FREE!`;
            mintBtn.style.opacity = '1';
        } else {
            mintBtn.disabled = true;
            mintBtn.textContent = '🔒 Score too low (5,000m min)';
            mintBtn.style.opacity = '0.5';
        }
    }
}

// ====================================
// ÜCRETSİZ NFT MINT FONKSİYONU
// ====================================
async function mintScoreNFT() {
    try {
        const score = finalScoreValue; // Global score variable
        const rarity = getScoreRarity(score);
        
        if (!rarity) {
            alert('Score too low to mint NFT! Minimum: 5,000m');
            return;
        }
        
        nftStatusEl.textContent = '⏳ Connecting wallet...';
        
        // MetaMask check
        if (typeof window.ethereum === 'undefined') {
            nftStatusEl.innerHTML = 
                '❌ Install <a href="https://metamask.io" target="_blank" style="color: #00ffff;">MetaMask</a> first!';
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Connect wallet
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        userAddress = accounts[0];
        signer = provider.getSigner();

        // Switch to Base Mainnet
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2105' }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x2105',
                        chainName: 'Base',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: [BASE_RPC_URL],
                        blockExplorerUrls: [BASE_EXPLORER_URL]
                    }]
                });
            } else {
                throw switchError;
            }
        }

        // Contract check
        if (NFT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            nftStatusEl.innerHTML = 
                '⚠️ Contract not deployed yet!<br><small>Coming soon...</small>';
            return;
        }

        nftStatusEl.textContent = `🎨 Creating ${rarity.icon} ${rarity.name} NFT...`;
        
        // NFT Metadata
        const metadata = {
            name: `Base Motor Race - ${score.toLocaleString()}m`,
            description: `${rarity.message}\n\n${score.toLocaleString()}m race on Base Motor Race! 🏍️💨\n\nRarity: ${rarity.name} ${rarity.icon}\nFree mint on Base Mainnet`,
            image: await generateNFTImage(),
            attributes: [
                { trait_type: 'Distance', value: score, display_type: 'number' },
                { trait_type: 'Distance (m)', value: `${score.toLocaleString()}m` },
                { trait_type: 'Rarity', value: rarity.name },
                { trait_type: 'Game', value: 'Base Motor Race' },
                { trait_type: 'Chain', value: 'Base' },
                { trait_type: 'Timestamp', value: Date.now(), display_type: 'date' },
                { trait_type: 'Player', value: userAddress.slice(0, 6) + '...' + userAddress.slice(-4) }
            ],
            external_url: window.location.origin,
            background_color: rarity.color.replace('#', '')
        };

        // Base64 encode
        const metadataJSON = JSON.stringify(metadata);
        const tokenURI = 'data:application/json;base64,' + 
            btoa(unescape(encodeURIComponent(metadataJSON)));

        // Connect to contract
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

        // Gas estimate
        const gasEstimate = await contract.estimateGas.mint(score, tokenURI);
        const gasPrice = await provider.getGasPrice();
        const gasCost = gasEstimate.mul(gasPrice);
        const gasCostEth = ethers.utils.formatEther(gasCost);
        
        nftStatusEl.innerHTML = `
            ⛓️ Minting ${rarity.icon} ${rarity.name} NFT...<br>
            <small style="color: #00ffff;">
                FREE Mint! Gas: ~${parseFloat(gasCostEth).toFixed(5)} ETH (~$${(parseFloat(gasCostEth) * 2500).toFixed(2)})
            </small>
        `;
        
        // MINT! (No value - it's free!)
        const tx = await contract.mint(score, tokenURI, {
            gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
        });
        
        nftStatusEl.innerHTML = `
            ⏳ Confirming on Base...<br>
            <small style="color: #ffaa00;">May take 10-30 seconds</small>
        `;
        
        // Wait for transaction
        const receipt = await tx.wait();
        
        // Get token ID
        let tokenId = 'N/A';
        if (receipt.events) {
            const mintEvent = receipt.events.find(e => e.event === 'NFTMinted');
            if (mintEvent && mintEvent.args) {
                tokenId = mintEvent.args.tokenId.toString();
            }
        }
        
        // Success!
        const explorerLink = `${BASE_EXPLORER_URL}/tx/${receipt.transactionHash}`;
        const nftLink = `${BASE_EXPLORER_URL}/token/${NFT_CONTRACT_ADDRESS}?a=${tokenId}`;
        
        nftStatusEl.innerHTML = `
            ✅ ${rarity.icon} ${rarity.name} NFT Minted!<br>
            <small>Token #${tokenId} - FREE! 🎁</small><br>
            <a href="${nftLink}" target="_blank" style="color: #00ffff; text-decoration: underline;">
                View on BaseScan
            </a>
        `;
        nftStatusEl.style.color = rarity.color;
        
        // Vibrate on success
        vibrateDevice(200);
        
        console.log('🎉 NFT Minted!');
        console.log('Score:', score);
        console.log('Rarity:', rarity.name);
        console.log('Token ID:', tokenId);
        console.log('Gas Cost:', gasCostEth, 'ETH');

    } catch (error) {
        console.error('Mint Error:', error);
        
        let errorMsg = 'Unknown error';
        
        if (error.code === 4001) {
            errorMsg = 'Transaction rejected';
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMsg = 'Insufficient ETH for gas';
        } else if (error.message && error.message.includes('gas')) {
            errorMsg = 'Insufficient gas fee';
        } else if (error.message) {
            errorMsg = error.message.slice(0, 100);
        }
        
        nftStatusEl.textContent = `❌ ${errorMsg}`;
        nftStatusEl.style.color = '#ff0000';
        
        vibrateDevice(50);
    }
}

// ====================================
// WEEKLY LEADERBOARD YÜKLEME
// ====================================
async function loadWeeklyLeaderboard() {
    try {
        if (NFT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            return;
        }
        
        const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
        
        const top3 = await contract.getCurrentWeeklyTop3();
        
        // Update UI
        for (let i = 0; i < 3; i++) {
            const leader = top3[i];
            const element = document.getElementById(`leader${i + 1}`);
            
            if (leader.score > 0) {
                const address = leader.player.slice(0, 6) + '...' + leader.player.slice(-4);
                element.textContent = `${address} - ${leader.score.toLocaleString()}m`;
            } else {
                element.textContent = 'No record yet';
            }
        }
        
        const weekNumber = await contract.currentWeek();
        console.log('📅 Current Week:', weekNumber.toString());
        
    } catch (error) {
        console.error('Leaderboard error:', error);
    }
}

// ====================================
// OYUN BAŞLADIĞINDA
// ====================================
window.addEventListener('DOMContentLoaded', function() {
    loadWeeklyLeaderboard();
    
    // Her 30 saniyede bir leaderboard'u güncelle
    setInterval(loadWeeklyLeaderboard, 30000);
});

</script>

<!-- CSS Ekle -->
<style>
.rarity-badge {
    display: inline-block;
    padding: 12px 25px;
    margin: 15px 0;
    border-radius: 15px;
    font-size: 22px;
    font-weight: bold;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    animation: rarityPulse 2s infinite;
}

@keyframes rarityPulse {
    0%, 100% { 
        transform: scale(1);
        filter: brightness(1);
    }
    50% { 
        transform: scale(1.05);
        filter: brightness(1.2);
    }
}
</style>
