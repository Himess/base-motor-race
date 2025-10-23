<!-- BASE MAINNET NFT MINTING CODE -->
<!-- index.html içine eklenecek güncellemeler -->

<!-- Head'e ekle: -->
<script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>

<!-- Script section: -->
<script>
// ====================================
// BASE MAINNET CONFIGURATION
// ====================================
const BASE_CHAIN_ID = 8453; // Base Mainnet
const BASE_RPC_URL = 'https://mainnet.base.org';
const BASE_EXPLORER_URL = 'https://basescan.org';

// TODO: Remix'te Base Mainnet'e deploy ettikten sonra buraya yapıştır!
const NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; 

const MINT_FEE = '0.0001'; // 0.0001 ETH (~$0.25)

// Gelişmiş NFT Contract ABI
const NFT_ABI = [
    "function mint(uint256 score, string memory tokenURI) public payable returns (uint256)",
    "function getRarity(uint256 score) public pure returns (string memory)",
    "function playerHighScore(address player) public view returns (uint256)",
    "function getPlayerTokens(address player) public view returns (uint256[])",
    "function getLeaderboard() public view returns (address[10], uint256[10])",
    "function totalSupply() public view returns (uint256)",
    "function MINT_FEE() public view returns (uint256)"
];

let provider = null;
let signer = null;

// ====================================
// SKOR BAZLI RARITY SİSTEMİ
// ====================================
function getScoreRarity(score) {
    if (score >= 1000) return {
        name: 'Legendary',
        color: '#FFD700',
        icon: '👑',
        message: 'LEGENDARY RUN!'
    };
    if (score >= 500) return {
        name: 'Epic',
        color: '#9945FF',
        icon: '💜',
        message: 'Epic achievement!'
    };
    if (score >= 250) return {
        name: 'Rare',
        color: '#14F195',
        icon: '💎',
        message: 'Rare score!'
    };
    return {
        name: 'Common',
        color: '#808080',
        icon: '🏍️',
        message: 'Good run!'
    };
}

// ====================================
// NFT MINT FONKSIYONU (MAINNET)
// ====================================
async function mintScoreNFT() {
    try {
        const rarity = getScoreRarity(finalScoreValue);
        
        nftStatusEl.textContent = '⏳ Connecting wallet...';
        
        // MetaMask kontrolü
        if (typeof window.ethereum === 'undefined') {
            nftStatusEl.innerHTML = '❌ Install <a href="https://metamask.io" target="_blank" style="color: #00ffff;">MetaMask</a> first!';
            nftStatusEl.style.color = '#ff0000';
            return;
        }

        // Provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Cüzdan bağla
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        userAddress = accounts[0];
        signer = provider.getSigner();

        // Base Mainnet'e geç
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2105' }], // 8453 hex
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

        // Contract kontrolü
        if (NFT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            nftStatusEl.innerHTML = '⚠️ Contract not deployed yet!<br>Check NFT-DEPLOYMENT.md';
            nftStatusEl.style.color = '#ffaa00';
            return;
        }

        nftStatusEl.textContent = `🎨 Creating ${rarity.name} NFT...`;
        
        // NFT Metadata
        const metadata = {
            name: `Base Motor Race - ${finalScoreValue}m`,
            description: `${rarity.message} ${finalScoreValue}m race on Base Motor Race! 🏍️💨\n\nRarity: ${rarity.name} ${rarity.icon}\nMinted on Base Mainnet`,
            image: await generateNFTImage(),
            attributes: [
                { trait_type: 'Distance (m)', value: finalScoreValue },
                { trait_type: 'Rarity', value: rarity.name },
                { trait_type: 'Game', value: 'Base Motor Race' },
                { trait_type: 'Chain', value: 'Base Mainnet' },
                { trait_type: 'Timestamp', value: Date.now() },
                { trait_type: 'Player', value: userAddress.slice(0, 6) + '...' + userAddress.slice(-4) }
            ],
            external_url: window.location.origin,
            background_color: rarity.color.replace('#', '')
        };

        // Base64 encode
        const metadataJSON = JSON.stringify(metadata);
        const tokenURI = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(metadataJSON)));

        // Contract'a bağlan
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

        // Balance kontrolü
        const balance = await signer.getBalance();
        const mintFeeWei = ethers.utils.parseEther(MINT_FEE);
        const estimatedGas = await contract.estimateGas.mint(finalScoreValue, tokenURI, { value: mintFeeWei });
        const gasPrice = await provider.getGasPrice();
        const totalCost = mintFeeWei.add(estimatedGas.mul(gasPrice));
        
        if (balance.lt(totalCost)) {
            nftStatusEl.textContent = '❌ Insufficient ETH for minting';
            nftStatusEl.style.color = '#ff0000';
            return;
        }

        // Maliyet bilgisi göster
        const costInEth = ethers.utils.formatEther(totalCost);
        nftStatusEl.innerHTML = `⛓️ Minting ${rarity.icon} ${rarity.name} NFT...<br><small style="color: #00ffff;">Cost: ~${parseFloat(costInEth).toFixed(6)} ETH</small>`;
        
        // MINT!
        const tx = await contract.mint(finalScoreValue, tokenURI, {
            value: mintFeeWei,
            gasLimit: estimatedGas.mul(120).div(100) // 20% buffer
        });
        
        nftStatusEl.innerHTML = `⏳ Confirming on Base...<br><small style="color: #ffaa00;">This may take 10-30 seconds</small>`;
        
        // Transaction bekle
        const receipt = await tx.wait();
        
        // Token ID'yi bul
        let tokenId = 'N/A';
        if (receipt.events) {
            const mintEvent = receipt.events.find(e => e.event === 'NFTMinted');
            if (mintEvent && mintEvent.args) {
                tokenId = mintEvent.args.tokenId.toString();
            }
        }
        
        // Başarı!
        const explorerLink = `${BASE_EXPLORER_URL}/tx/${receipt.transactionHash}`;
        const nftLink = `${BASE_EXPLORER_URL}/token/${NFT_CONTRACT_ADDRESS}?a=${tokenId}`;
        
        nftStatusEl.innerHTML = `
            ✅ ${rarity.icon} ${rarity.name} NFT Minted!<br>
            <small>Token #${tokenId}</small><br>
            <a href="${nftLink}" target="_blank" style="color: #00ffff; text-decoration: underline;">View on BaseScan</a>
        `;
        nftStatusEl.style.color = rarity.color;
        
        console.log('🎉 NFT Minted Successfully!');
        console.log('Rarity:', rarity.name);
        console.log('Transaction:', explorerLink);
        console.log('Token ID:', tokenId);
        console.log('Total Cost:', costInEth, 'ETH');

    } catch (error) {
        console.error('NFT Mint Error:', error);
        
        let errorMsg = 'Unknown error';
        
        if (error.code === 4001) {
            errorMsg = 'Transaction rejected by user';
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMsg = 'Insufficient ETH balance';
        } else if (error.message && error.message.includes('gas')) {
            errorMsg = 'Insufficient gas fee';
        } else if (error.message) {
            errorMsg = error.message.slice(0, 100);
        }
        
        nftStatusEl.textContent = `❌ ${errorMsg}`;
        nftStatusEl.style.color = '#ff0000';
    }
}

// ====================================
// LEADERBOARD FONKSIYONU (OPSIYONEL)
// ====================================
async function loadLeaderboard() {
    try {
        if (!provider) {
            provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);
        }
        
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
        const [players, scores] = await contract.getLeaderboard();
        
        // Leaderboard'u göster (UI'da bir yere eklenebilir)
        console.log('🏆 Top 10 Scores:', players, scores);
        
        return { players, scores };
    } catch (error) {
        console.error('Leaderboard error:', error);
    }
}

// ====================================
// USER STATS FONKSIYONU (OPSIYONEL)
// ====================================
async function loadUserStats(address) {
    try {
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
        
        const highScore = await contract.playerHighScore(address);
        const tokens = await contract.getPlayerTokens(address);
        
        console.log('📊 Your Stats:');
        console.log('High Score:', highScore.toString());
        console.log('NFTs Minted:', tokens.length);
        
        return {
            highScore: highScore.toNumber(),
            nftCount: tokens.length
        };
    } catch (error) {
        console.error('User stats error:', error);
    }
}
</script>

<!-- Game Over screen'e rarity bilgisi ekle: -->
<style>
.rarity-badge {
    display: inline-block;
    padding: 10px 20px;
    margin: 15px 0;
    border-radius: 10px;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
</style>
