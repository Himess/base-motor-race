# 🎨 NFT Minting Setup Guide

## 📋 Adımlar

### 1. Smart Contract Deploy Et (Remix IDE)

1. **Remix IDE'ye git:** https://remix.ethereum.org
2. `BaseMotorRaceNFT.sol` dosyasını oluştur ve içeriği yapıştır
3. Compile et (Solidity 0.8.20+)
4. **Deploy:**
   - Environment: "Injected Provider - MetaMask"
   - Network: **Base Sepolia** (testnet)
   - Deploy butonuna bas
5. **Contract adresini kopyala!**

### 2. Base Sepolia Test ETH Al

**Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

veya

https://sepolia-faucet.base.org/

### 3. HTML'e Contract Adresini Ekle

`index.html` dosyasında:

```javascript
const NFT_CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS_HERE';
```

Kısmını güncelle!

### 4. Test Et!

1. Oyunu oyna
2. Game Over olunca "Mint as NFT" butonuna bas
3. MetaMask'ta transaction'ı onayla
4. BaseScan'de görüntüle!

## 🔗 Linkler

- **Base Sepolia Explorer:** https://sepolia.basescan.org
- **Remix IDE:** https://remix.ethereum.org
- **Base Faucet:** https://sepolia-faucet.base.org

## ⚠️ Önemli

- Testnet kullanıyoruz (Base Sepolia)
- Gerçek ETH değil, test ETH
- Mainnet'e geçmek için:
  - Contract'ı Base Mainnet'e deploy et
  - `BASE_CHAIN_ID = 8453` yap
  - RPC URL: `https://mainnet.base.org`

## 💰 Maliyet

- Test NFT mint: **ÜCRETSİZ** (test ETH)
- Mainnet NFT mint: ~0.0001-0.0005 ETH (gas fee)

---

Başarılar! 🚀
