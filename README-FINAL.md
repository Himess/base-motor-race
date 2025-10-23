# 🏍️ BASE MOTOR RACE - Final Version

## ✨ Özellikler

### 🎮 Oyun
- ✅ Smooth motor kontrolü (3 şerit)
- ✅ Dinamik hız artışı
- ✅ Crash ses efektleri ve yavaşlama
- ✅ Yanıp sönme efekti (hasar almazlık)
- ✅ 3 can sistemi

### 🎨 NFT Sistemi (Ücretsiz!)
- ✅ **Tamamen ücretsiz mint** (sadece Base gas ~$0.20)
- ✅ **Skor bazlı rarity:**
  - 🏍️ Common (5,000-7,499m)
  - 💎 Rare (7,500-9,999m)
  - 💜 Epic (10,000-19,999m)
  - 👑 Legendary (20,000m+)
- ✅ On-chain leaderboard
- ✅ Player stats tracking

### 🏆 Haftalık Ödüller
- 🥇 1st Place - Özel "Champion" NFT
- 🥈 2nd Place - "Runner-up" NFT
- 🥉 3rd Place - "Top 3" NFT
- Her Pazartesi otomatik airdrop

### 🎵 Menü ve Ayarlar
- ✅ Ana menü sistemi
- ✅ Müzik volume kontrolü
- ✅ SFX volume kontrolü
- ✅ Müzik açma/kapama
- ✅ Vibration toggle
- ✅ LocalStorage ile kayıt

## 📦 Kurulum

### 1. Contract Deploy (Remix IDE)

1. **https://remix.ethereum.org**
2. `contract/BaseMotorRaceNFT-Final.sol` yükle
3. Compile (0.8.20+)
4. Deploy:
   - Network: **Base Mainnet**
   - Gas: ~0.002 ETH
5. **Contract adresini kopyala!**

### 2. Frontend Entegrasyonu

#### A. Ana Menü Ekle

`menu-system.html` içeriğini `index.html`'e ekle:
- CSS → `<style>` içine
- HTML → `<div id="gameContainer">` içine
- JavaScript → `<script>` içine

#### B. NFT Sistemi Ekle

`nft-final-integration.js` içeriğini `index.html`'e ekle:
- Ethers.js import
- NFT fonksiyonları
- Contract adresi güncelleme:

```javascript
const NFT_CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS';
```

### 3. Deploy (Vercel)

```bash
git init
git add .
git commit -m "Base Motor Race v1.0"
git remote add origin https://github.com/YOUR_USERNAME/base-motor-race.git
git push -u origin main
```

Vercel'de:
- Framework: **Other**
- Output Directory: `.`
- Deploy!

## 🎯 Kullanım

### Oyuncu Akışı

1. **Ana Menü**
   - Play Game
   - Settings (ses ayarları)
   - Leaderboard

2. **Oyun**
   - Sol/Sağ ok tuşları veya ekran butonları
   - 3 can
   - Skor kazan

3. **Game Over**
   - Skorunu gör
   - Rarity badge gör
   - "Mint NFT - FREE!" butonuna bas
   - MetaMask ile onayla (~$0.20 gas)
   - NFT Base'de mint olur!

### Owner İşlemleri

**Haftalık Ödüller (Her Pazartesi):**

```javascript
// Remix'te contract'a bağlan
// mintWeeklyReward fonksiyonunu çağır

await contract.mintWeeklyReward(
    "0xWINNER_ADDRESS",
    1, // Position (1, 2, or 3)
    "data:application/json;base64,..." // TokenURI
);
```

**Yeni Hafta Başlat:**

```javascript
await contract.startNewWeek();
```

## 📊 Skor Sistemi

| Rarity | Skor Aralığı | Beklenen % | Zorluk |
|--------|-------------|-----------|--------|
| Common | 5,000-7,499m | ~70% | Orta |
| Rare | 7,500-9,999m | ~20% | Zor |
| Epic | 10,000-19,999m | ~8% | Çok Zor |
| Legendary | 20,000m+ | ~2% | İMKANSIZ |

## 💰 Maliyet Analizi

### Oyuncu
- **Mint Fee:** 0 ETH (Ücretsiz!)
- **Gas Fee:** ~0.00005-0.0001 ETH (~$0.15-0.25)

### Owner (Tek Seferlik)
- **Contract Deploy:** ~0.002 ETH (~$5)
- **Weekly Rewards:** ~0.0001 ETH per NFT (~$0.25)

## 🔧 Teknik Detaylar

### Stack
- Frontend: HTML5 + Canvas + Web Audio API
- Blockchain: Base Mainnet (EVM)
- Smart Contract: Solidity 0.8.20 + OpenZeppelin
- Web3: Ethers.js v5

### Contract Features
```solidity
- mint(uint256 score, string tokenURI) // Free mint!
- mintWeeklyReward(address, position, tokenURI) // Owner only
- getRarity(uint256 score)
- getCurrentWeeklyTop3()
- getGlobalLeaderboard()
- playerHighScore(address)
```

## 🎨 Özelleştirme

### Rarity Skorları Değiştir

`contract/BaseMotorRaceNFT-Final.sol`:
```solidity
uint256 public constant COMMON_MIN = 5000;
uint256 public constant RARE_MIN = 7500;
uint256 public constant EPIC_MIN = 10000;
uint256 public constant LEGENDARY_MIN = 20000;
```

### Ses Ayarları

`gameSettings` objesi:
```javascript
{
    musicVolume: 0.7,
    sfxVolume: 1.0,
    musicEnabled: true,
    vibrationEnabled: true
}
```

## 🐛 Troubleshooting

### "Score too low"
- Minimum 5,000m gerekli
- Oyunu oyna ve skoru artır!

### "Insufficient funds"
- Base Mainnet ETH gerekli
- Bridge: https://bridge.base.org

### "Contract not deployed"
- `NFT_CONTRACT_ADDRESS` güncellenecek
- Remix'te deploy et

### Leaderboard yüklenmiyor
- Contract doğru deploy edildi mi?
- RPC URL doğru mu?
- Console'u kontrol et

## 📱 Base Mini App Setup

1. Developer mode aç: https://farcaster.xyz/~/settings/developer-tools
2. Account association: https://base.dev/build
3. `.well-known/farcaster.json` güncelle
4. Deploy ve test!

## 🎯 Marketing İpuçları

- "Free NFT minting on Base!"
- "20,000m = LEGENDARY 👑"
- "Weekly prizes for top 3 racers!"
- "No mint fee - only gas!"
- Social share butonu ekle

## 🔗 Linkler

- **Base Explorer:** https://basescan.org
- **Base Bridge:** https://bridge.base.org
- **OpenSea (Base):** https://opensea.io/assets/base/[contract]
- **Remix IDE:** https://remix.ethereum.org

## 📄 Lisans

MIT

## 🤝 Katkı

PRs welcome! Issues'a bug report gönderebilirsin.

---

**Built with ❤️ on Base** 🔵

🏍️ Race hard. Mint free. Go legendary! 🚀
